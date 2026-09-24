declare module 'midtrans-client' {
  export interface SnapOptions {
    isProduction: boolean
    serverKey: string
    clientKey?: string
  }

  export interface CreateTransactionResponse {
    token: string
    redirect_url: string
  }

  export class SnapClient {
    constructor(options: SnapOptions)
    createTransaction(parameter: Record<string, unknown>): Promise<CreateTransactionResponse>
  }

  interface MidtransModule {
    Snap: typeof SnapClient
  }

  const midtransModule: MidtransModule
  export default midtransModule
}
