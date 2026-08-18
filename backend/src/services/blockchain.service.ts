import https from 'https';

export class BlockchainService {
  private etherscanApiKey: string;
  private bscscanApiKey: string;
  private toncenterApiKey: string;

  constructor() {
    this.etherscanApiKey = process.env.ETHERSCAN_API_KEY || 'C9XQ1EV83R3HTP45Q8W82JWEUKY6GNQ4SW';
    this.bscscanApiKey = process.env.BSCSCAN_API_KEY || process.env.ETHERSCAN_API_KEY || 'C9XQ1EV83R3HTP45Q8W82JWEUKY6GNQ4SW';
    this.toncenterApiKey = process.env.TONCENTER_API_KEY || '319042772578050e1c2dea8cd788186fb62daf5ed63f81a9dc008fd3f3b5f550';
  }

  private fetchJson(url: string, headers?: Record<string, string>): Promise<any> {
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          'User-Agent': 'VextoralMining-BlockchainScanner',
          ...headers
        }
      };
      https.get(url, options, (res) => {
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

  public async verifyTransaction(txHash: string, network: 'BEP20' | 'TON' | 'ERC20' | 'ETH' = 'BEP20'): Promise<{
    verified: boolean;
    amount?: number;
    toAddress?: string;
    fromAddress?: string;
    status?: string;
    confirmations?: number;
    network: string;
  }> {
    try {
      if (network === 'TON') {
        const url = `https://toncenter.com/api/v2/jsonRPC?api_key=${this.toncenterApiKey}`;
        const postData = JSON.stringify({
          id: '1',
          jsonrpc: '2.0',
          method: 'getTransaction',
          params: { hash: txHash }
        });

        const res: any = await new Promise((resolve, reject) => {
          const req = https.request('https://toncenter.com/api/v2/jsonRPC', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': this.toncenterApiKey,
              'Content-Length': Buffer.byteLength(postData)
            }
          }, (response) => {
            let body = '';
            response.on('data', c => body += c);
            response.on('end', () => {
              try { resolve(JSON.parse(body)); } catch (e) { reject(e); }
            });
          });
          req.on('error', reject);
          req.write(postData);
          req.end();
        });

        if (res && res.result) {
          return {
            verified: true,
            status: 'success',
            confirmations: 1,
            network: 'TON'
          };
        }
        return { verified: false, network: 'TON' };
      }

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
          confirmations: 12,
          network: isBsc ? 'BEP20' : 'ERC20'
        };
      }
      return { verified: false, network };
    } catch (e) {
      console.error('Blockchain verification error:', e);
      return { verified: false, network };
    }
  }

  public async getRecentTransfers(walletAddress: string, network: 'BEP20' | 'TON' | 'ERC20' = 'BEP20'): Promise<any[]> {
    try {
      if (network === 'TON') {
        const url = `https://toncenter.com/api/v2/getTransactions?address=${encodeURIComponent(walletAddress)}&limit=10&api_key=${this.toncenterApiKey}`;
        const response = await this.fetchJson(url);
        if (response && response.ok && Array.isArray(response.result)) {
          return response.result;
        }
        return [];
      }

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
