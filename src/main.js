// Event listener for start button
document.getElementById('start-button').addEventListener('click', () => {
    simulateBusyUIThread();
});

// Function to simulate UI thread busyness
function simulateBusyUIThread() {
    console.log('Simulating UI thread busyness...');

    // Display "started" status
    document.getElementById('fake-calculation-task-status').textContent = 'Started';

    // Start the dedicated worker to fetch records
    const worker = new Worker('src/worker.js');

    // Listen for messages from the worker
    worker.addEventListener('message', event => {
        if (event.data && event.data.action === 'recordsFetched') {
            // Handle fetched records
            displayFetchedRecords(event.data.records);
            // Display "completed" status
            document.getElementById('fake-calculation-task-status').textContent = 'Completed';
        }
    });

    // Start the fetch operation
    worker.postMessage({ action: 'fetchRecords' });

    ///*
    // Schedule a task to keep the UI thread busy
    scheduler.postTask(() => {
        // Simulate fake calculation task
        const startTime = performance.now();
        while (performance.now() - startTime < 100) {
            // Fake calculation task
        }
        console.log('UI thread is now busy.');
    });//*/

    /*
    // Simulate UI thread busyness with a delay of 100 milliseconds
    setTimeout(() => {
        console.log('UI thread is now busy.');
    }, 100);
    */
}

// Function to display fetched records
function displayFetchedRecords(records) {
    const recordsList = document.getElementById('records-list');
    records.forEach(record => {
        const listItem = document.createElement('div');
        listItem.textContent = record;
        recordsList.appendChild(listItem);
    });
}
