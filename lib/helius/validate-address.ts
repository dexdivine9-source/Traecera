export async function validateSolanaAddress(address: string): Promise<'program' | 'wallet' | 'invalid'> {
  try {
    const response = await fetch("https://api.mainnet-beta.solana.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getAccountInfo",
        params: [
          address,
          { encoding: "base64" }
        ]
      })
    });

    if (!response.ok) {
      return 'invalid';
    }

    const result = await response.json();
    
    if (result.value === null) {
      return 'invalid';
    }

    if (result.value.executable === true) {
      return 'program';
    }

    return 'wallet';
  } catch (error) {
    console.error(`[validateSolanaAddress] Error validating address ${address}`, error);
    return 'invalid';
  }
}
