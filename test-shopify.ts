async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/test-shopify');
    console.log('Status:', res.status);
    console.log('Body:', await res.text());
  } catch (e: any) {
    console.error('Error:', e.message);
  }
}

test();
