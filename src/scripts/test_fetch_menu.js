async function main() {
  try {
    console.log('Fetching http://localhost:3000/api/menus...');
    const res = await fetch('http://localhost:3000/api/menus');
    if (!res.ok) {
      throw new Error(`Status ${res.status}`);
    }
    const data = await res.json();
    console.log('API RESPONSE COUNT:', data.length);
    console.log(JSON.stringify(data, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Fetch failed:', err.message);
    process.exit(1);
  }
}
main();
