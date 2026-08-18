import https from 'https';

export class BlockchainService {
  private etherscanApiKey: string;
  private bscscanApiKey: string;

  constructor() {
    this.etherscanApiKey = process.env.ETHERSCAN_API_KEY || 'C9XQ1EV83R3HTP45Q8W82JWEUKY6GNQ4SW';
    this.bscscanApiKey = process.env.BSCSCAN_API_KEY || process.env.ETHERSCAN_API_KEY || 'C9XQ1EV83R3HTP45Q8W82JWEUKY6GNQ4SW';
  }

  private fetchJson(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      }).on('error', reject);
    });
  }

  public async verifyTransaction(txHash: string, network: 'BEP20' | 'ERC20' | 'ETH' = 'BEP20'): Promise<{
    verified: boolean;
    amount?: number;
    toAddress?: string;
    fromAddress?: string;
    status?: string;
    confirmations?: number;
  }> {
    try {
      const isBsc = network === 'BEP20';
      const baseUrl = isBsc ? 'https://api.bscscan.com/api' : 'https://api.etherscan.io/api';
      const apiKey = isBsc ? this.bscscanApiKey : this.etherscanApiKey;

      const url = `${baseUrl}?module=proxy&action=eth_getTransactionReceipt&txhash=${txHash}&apikey=${apiKey}`;
      const response = await this.fetchJson(url);

      if (response && response.result) {
        const receipt = response.result;
        const status = receipt.status === '0x1' ? 'success' : 'failed';
        return {
          verified: status === 'success',
          toAddress: receipt.to,
          fromAddress: receipt.from,
          status,
          confirmations: 12
        };
      }
      return { verified: false };
    } catch (e) {
      console.error('Blockchain verification error:', e);
      return { verified: false };
    }
  }

  public async getRecentTransfers(walletAddress: string, network: 'BEP20' | 'ERC20' = 'BEP20'): Promise<any[]> {
    try {
      const isBsc = network === 'BEP20';
      const baseUrl = isBsc ? 'https://api.bscscan.com/api' : 'https://api.etherscan.io/api';
      const apiKey = isBsc ? this.bscscanApiKey : this.etherscanApiKey;

      const url = `${baseUrl}?module=account&action=tokentx&address=${walletAddress}&page=1&offset=10&sort=desc&apikey=${apiKey}`;
      const response = await this.fetchJson(url);

      if (response && response.status === '1' && Array.isArray(response.result)) {
        return response.result;
      }
      return [];
    } catch (e) {
      console.error('Fetch transfers error:', e);
      return [];
    }
  }
}

export const blockchainService = new BlockchainService();
