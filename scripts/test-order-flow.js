// Native fetch is available in Node 18+
// const fetch = require('node-fetch'); 

const API_URL = 'http://localhost:5001/api/orders';

const testOrder = {
    customer: {
        name: "Test User",
        email: "test@example.com",
        phone: "1234567890",
        address: "123 Test St"
    },
    items: [
        {
            name: "Test Item",
            price: 100,
            quantity: 2
        }
    ],
    totalAmount: 200,
    paymentMethod: "COD"
};

async function runTest() {
    console.log("Starting Order System Verified...");

    try {
        // 1. Create Order
        console.log("\n1. Creating Order...");
        const createRes = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testOrder)
        });

        const createData = await createRes.json();

        if (!createRes.ok) {
            console.error("Failed to create order:", createData);
            return;
        }

        console.log("Order Created Successfully!");
        console.log("Order Number:", createData.orderNumber);
        console.log("Order ID:", createData.orderId);

        if (!createData.orderNumber.startsWith("ORD-")) {
            console.error("ERROR: Invalid order number format!");
            return;
        }

        if (createData.success !== true) {
            console.error("ERROR: Success flag missing!");
            return;
        }

        // 2. Get Order By ID
        console.log(`\n2. Fetching Order by ID: ${createData.orderId}...`);
        const getRes = await fetch(`${API_URL}/${createData.orderId}`);
        const getData = await getRes.json();

        if (!getRes.ok) {
            console.error("Failed to get order:", getData);
            return;
        }

        console.log("Order Fetched Successfully!");
        console.log("Customer Name:", getData.data.customer.name);

        if (getData.data.orderNumber !== createData.orderNumber) {
            console.error("ERROR: Order number mismatch!");
            return;
        }

        // 3. Get Order By Number
        console.log(`\n3. Fetching Order by Number: ${createData.orderNumber}...`);
        const getNumRes = await fetch(`${API_URL}/number/${createData.orderNumber}`);
        const getNumData = await getNumRes.json();

        if (!getNumRes.ok) {
            console.error("Failed to get order by number:", getNumData);
            return;
        }
        console.log("Order Fetched By Number Successfully!");


        // 4. Test Duplicate Prevention (Retry Logic Check - theoretical, hard to force without mocking)
        // We can at least create another order and verify it has a DIFFERENT order number
        console.log("\n4. Creating Second Order to verify uniqueness...");
        const createRes2 = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testOrder)
        });
        const createData2 = await createRes2.json();

        if (createData.orderNumber === createData2.orderNumber) {
            console.error("ERROR: Duplicate order numbers generated!");
            return;
        }
        console.log("Second Order Created:", createData2.orderNumber);
        console.log("Uniqueness Verified!");

        console.log("\n✅ ALL TESTS PASSED");

    } catch (error) {
        console.error("Test Failed with Error:", error);
    }
}

runTest();
