async function debugSuperteam() {
  const endpoints = [
    "https://earn.superteam.fun/api/listings?category=project&region=nigeria",
    "https://earn.superteam.fun/api/listings?type=project",
    "https://earn.superteam.fun/api/bounties?type=project",
    "https://earn.superteam.fun/api/grants"
  ];

  for (let i = 0; i < endpoints.length; i++) {
    const url = endpoints[i];
    console.log(`\n--- SUPERTEAM ENDPOINT ${i + 1} ---`);
    console.log(`URL: ${url}`);
    try {
      const res = await fetch(url);
      console.log(`Status: ${res.status} ${res.statusText}`);
      
      const text = await res.text();
      console.log(`Body (first 500 chars):\n${text.substring(0, 500)}`);
      
      try {
        const json = JSON.parse(text);
        let items = json.listings || json.bounties || json.grants || json.data || json;
        if (!Array.isArray(items)) {
          if (Array.isArray(json)) items = json;
          else items = Object.values(json).find(Array.isArray) || [];
        }
        
        console.log(`Parsed items: ${Array.isArray(items) ? items.length : 'Not an array'}`);
        if (Array.isArray(items) && items.length > 0) {
           console.log("First item sample properties:", Object.keys(items[0]).join(", "));
        }
      } catch (e) {
        console.log("Could not parse JSON");
      }
    } catch (e) {
      console.log("Fetch failed:", e);
    }
  }
}

async function debugDoraHacks() {
  console.log(`\n--- DORAHACKS ENDPOINT ---`);
  const url = "https://dorahacks.io/api/hackathon/buidl/list?tags=solana";
  console.log(`URL: ${url}`);
  try {
    const res = await fetch(url);
    console.log(`Status: ${res.status} ${res.statusText}`);
    
    const text = await res.text();
    console.log(`Body (first 500 chars):\n${text.substring(0, 500)}`);
    
    try {
        const json = JSON.parse(text);
        let items = json?.data?.list || json?.list || json?.data || [];
        console.log(`Parsed items: ${Array.isArray(items) ? items.length : 'Not an array'}`);
        if (Array.isArray(items) && items.length > 0) {
           console.log("First item sample properties:", Object.keys(items[0]).join(", "));
        }
    } catch (e) {
      console.log("Could not parse JSON");
    }
  } catch (e) {
    console.log("Fetch failed:", e);
  }
}

async function main() {
  await debugSuperteam();
  await debugDoraHacks();
}

main();
