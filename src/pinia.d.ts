import 'pinia'

declare module 'pinia' {
  // DefineStoreOptions（オブジェクト式）だけでなく
  // DefineSetupStoreOptions（セットアップ式）にも persist を許可
  export interface DefineStoreOptionsBase<S, Store> {
    /**
     * pinia plugin: piniaPersistPlugin による永続化設定
     * boolean で on/off、object で細かいオプション指定が可能
     */
    persist?: boolean | Record<string, any>
  }
}
