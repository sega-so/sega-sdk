import { Connection, Keypair, PublicKey, EpochInfo, Commitment } from "@solana/web3.js";
import { merge } from "lodash";

import { Api, API_URL_CONFIG, ApiV3TokenRes, ApiV3Token, JupTokenType, AvailabilityCheckAPI3 } from "../api";
import { EMPTY_CONNECTION, EMPTY_OWNER } from "../common/error";
import { createLogger, Logger } from "../common/logger";
import { Owner } from "../common/owner";
import { Cluster } from "../solana";

import Account, { TokenAccountDataProp } from "./account/account";
import Cpmm from "./cpmm/cpmm";
import Utils1216 from "./utils1216";

import TokenModule from "./token/token";
import { SignAllTransactions } from "./type";

export interface SegaLoadParams extends TokenAccountDataProp, Omit<SegaApiBatchRequestParams, "api"> {
  /* ================= solana ================= */
  // solana web3 connection
  connection: Connection;
  // solana cluster/network/env
  cluster?: Cluster;
  // user public key
  owner?: PublicKey | Keypair;
  /* ================= api ================= */
  // api request interval in ms, -1 means never request again, 0 means always use fresh data, default is 5 mins (5 * 60 * 1000)
  apiRequestInterval?: number;
  // api request timeout in ms, default is 10 secs (10 * 1000)
  apiRequestTimeout?: number;
  apiCacheTime?: number;
  signAllTransactions?: SignAllTransactions;
  urlConfigs?: API_URL_CONFIG;
  logRequests?: boolean;
  logCount?: number;
  jupTokenType?: JupTokenType;
  disableFeatureCheck?: boolean;
  disableLoadToken?: boolean;
  blockhashCommitment?: Commitment;
  loopMultiTxStatus?: boolean;
}

export interface SegaApiBatchRequestParams {
  api: Api;
  defaultChainTimeOffset?: number;
  defaultChainTime?: number;
}

export type SegaConstructorParams = Required<SegaLoadParams> & SegaApiBatchRequestParams;

interface DataBase<T> {
  fetched: number;
  data: T;
  extInfo?: Record<string, any>;
}
interface ApiData {
  tokens?: DataBase<ApiV3Token[]>;

  // v3 data
  tokenList?: DataBase<ApiV3TokenRes>;
  jupTokenList?: DataBase<ApiV3Token[]>;
}

export class Sega {
  public cluster: Cluster;
  public account: Account;
  public cpmm: Cpmm;
  public utils1216: Utils1216;
  public token: TokenModule;
  public rawBalances: Map<string, string> = new Map();
  public apiData: ApiData;
  public availability: Partial<AvailabilityCheckAPI3>;
  public blockhashCommitment: Commitment;
  public loopMultiTxStatus?: boolean;

  private _connection: Connection;
  private _owner: Owner | undefined;
  public api: Api;
  private _apiCacheTime: number;
  private _signAllTransactions?: SignAllTransactions;
  private logger: Logger;
  private _chainTime?: {
    fetched: number;
    value: {
      chainTime: number;
      offset: number;
    };
  };
  private _epochInfo?: {
    fetched: number;
    value: EpochInfo;
  };

  constructor(config: SegaConstructorParams) {
    const {
      connection,
      cluster,
      owner,
      api,
      defaultChainTime,
      defaultChainTimeOffset,
      apiCacheTime,
      blockhashCommitment = "confirmed",
      loopMultiTxStatus,
    } = config;

    this._connection = connection;
    this.cluster = cluster || "mainnet";
    this._owner = owner ? new Owner(owner) : undefined;
    this._signAllTransactions = config.signAllTransactions;
    this.blockhashCommitment = blockhashCommitment;
    this.loopMultiTxStatus = loopMultiTxStatus;

    this.api = api;
    this._apiCacheTime = apiCacheTime || 5 * 60 * 1000;
    this.logger = createLogger("Sega");
    this.account = new Account({
      scope: this,
      moduleName: "Sega_Account",
      tokenAccounts: config.tokenAccounts,
      tokenAccountRawInfos: config.tokenAccountRawInfos,
    });
    this.token = new TokenModule({ scope: this, moduleName: "Sega_tokenV2" });
    this.cpmm = new Cpmm({ scope: this, moduleName: "Sega_cpmm" });
    this.utils1216 = new Utils1216({ scope: this, moduleName: "Sega_utils1216" });

    this.availability = {};
    const now = new Date().getTime();
    this.apiData = {};

    if (defaultChainTimeOffset)
      this._chainTime = {
        fetched: now,
        value: {
          chainTime: defaultChainTime || Date.now() - defaultChainTimeOffset,
          offset: defaultChainTimeOffset,
        },
      };
  }

  static async load(config: SegaLoadParams): Promise<Sega> {
    const custom: Required<SegaLoadParams> = merge(
      // default
      {
        cluster: "mainnet",
        owner: null,
        apiRequestInterval: 5 * 60 * 1000,
        apiRequestTimeout: 10 * 1000,
      },
      config,
    );
    const { cluster, apiRequestTimeout, logCount, logRequests, urlConfigs } = custom;

    const api = new Api({ cluster, timeout: apiRequestTimeout, urlConfigs, logCount, logRequests });
    const sega = new Sega({
      ...custom,
      api,
    });

    await sega.fetchAvailabilityStatus(config.disableFeatureCheck ?? true);
    if (!config.disableLoadToken)
      await sega.token.load({
        type: config.jupTokenType,
      });

    return sega;
  }

  get owner(): Owner | undefined {
    return this._owner;
  }
  get ownerPubKey(): PublicKey {
    if (!this._owner) throw new Error(EMPTY_OWNER);
    return this._owner.publicKey;
  }
  public setOwner(owner?: PublicKey | Keypair): Sega {
    this._owner = owner ? new Owner(owner) : undefined;
    this.account.resetTokenAccounts();
    return this;
  }
  get connection(): Connection {
    if (!this._connection) throw new Error(EMPTY_CONNECTION);
    return this._connection;
  }
  public setConnection(connection: Connection): Sega {
    this._connection = connection;
    return this;
  }
  get signAllTransactions(): SignAllTransactions | undefined {
    return this._signAllTransactions;
  }
  public setSignAllTransactions(signAllTransactions?: SignAllTransactions): Sega {
    this._signAllTransactions = signAllTransactions;
    return this;
  }

  public checkOwner(): void {
    if (!this.owner) {
      console.error(EMPTY_OWNER);
      throw new Error(EMPTY_OWNER);
    }
  }

  private isCacheInvalidate(time: number): boolean {
    return new Date().getTime() - time > this._apiCacheTime;
  }

  public async fetchChainTime(): Promise<void> {
    try {
      const data = await this.api.getChainTimeOffset();
      this._chainTime = {
        fetched: Date.now(),
        value: {
          chainTime: Date.now() + data.offset * 1000,
          offset: data.offset * 1000,
        },
      };
    } catch {
      this._chainTime = undefined;
    }
  }

  public async fetchV3TokenList(forceUpdate?: boolean): Promise<ApiV3TokenRes> {
    if (this.apiData.tokenList && !this.isCacheInvalidate(this.apiData.tokenList.fetched) && !forceUpdate)
      return this.apiData.tokenList.data;
    try {
      const segaList = await this.api.getTokenList();
      const dataObject = {
        fetched: Date.now(),
        data: segaList,
      };
      this.apiData.tokenList = dataObject;

      return dataObject.data;
    } catch (e) {
      console.error(e);
      return {
        mintList: [],
        blacklist: [],
        whiteList: [],
      };
    }
  }

  public async fetchJupTokenList(forceUpdate?: boolean): Promise<ApiV3Token[]> {
    const prevFetched = this.apiData.jupTokenList;
    if (prevFetched && !this.isCacheInvalidate(prevFetched.fetched) && !forceUpdate) return prevFetched.data;
    try {
      const jupList = await this.api.getJupTokenList();
      this.apiData.jupTokenList = {
        fetched: Date.now(),
        data: jupList.map((t) => ({
          ...t,
          mintAuthority: t.mint_authority || undefined,
          freezeAuthority: t.freeze_authority || undefined,
        })),
      };

      return this.apiData.jupTokenList.data;
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  get chainTimeData(): { offset: number; chainTime: number } | undefined {
    return this._chainTime?.value;
  }

  public async chainTimeOffset(): Promise<number> {
    if (this._chainTime && Date.now() - this._chainTime.fetched <= 1000 * 60 * 5) return this._chainTime.value.offset;
    await this.fetchChainTime();
    return this._chainTime?.value.offset || 0;
  }

  public async currentBlockChainTime(): Promise<number> {
    if (this._chainTime && Date.now() - this._chainTime.fetched <= 1000 * 60 * 5)
      return this._chainTime.value.chainTime;
    await this.fetchChainTime();
    return this._chainTime?.value.chainTime || Date.now();
  }

  public async fetchEpochInfo(): Promise<EpochInfo> {
    if (this._epochInfo && Date.now() - this._epochInfo.fetched <= 1000 * 30) return this._epochInfo.value;
    this._epochInfo = {
      fetched: Date.now(),
      value: await this.connection.getEpochInfo(),
    };
    return this._epochInfo.value;
  }

  public async fetchAvailabilityStatus(skipCheck?: boolean): Promise<Partial<AvailabilityCheckAPI3>> {
    if (skipCheck) return {};
    try {
      const data = await this.api.fetchAvailabilityStatus();
      const isAllDisabled = data.all === false;
      this.availability = {
        all: data.all,
        swap: isAllDisabled ? false : data.swap,
        createConcentratedPosition: isAllDisabled ? false : data.createConcentratedPosition,
        addConcentratedPosition: isAllDisabled ? false : data.addConcentratedPosition,
        addStandardPosition: isAllDisabled ? false : data.addStandardPosition,
        removeConcentratedPosition: isAllDisabled ? false : data.removeConcentratedPosition,
        removeStandardPosition: isAllDisabled ? false : data.removeStandardPosition,
        addFarm: isAllDisabled ? false : data.addFarm,
        removeFarm: isAllDisabled ? false : data.removeFarm,
      };
      return data;
    } catch {
      return {};
    }
  }
}
