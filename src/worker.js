// Function to fetch records from IndexedDB asynchronously
function fetchBatchForward(store) {

    fetchEmployeesInBatch(store, 10, null);
}

//-------GetAll() API for Batch retriving records in forward direction ----------

function fetchEmployeesInBatch(store, batchSize, keyRange) {
    const start = performance.now();
    store.getAll(keyRange, batchSize).onsuccess = e => {
        const records = e.target.result;

        // Post a message back to the main thread with the fetched records
        self.postMessage({ action: 'recordsFetched', records: records });

        fetchMore(store, records, batchSize, keyRange);

        const end = performance.now();
        console.log(`Worker: Employees batch of ${batchSize} fetched
            in ${(end - start).toFixed(2)} ms.`);
    };
}

function fetchMore(store, records, batchSize, keyRange) {
      if (records && records.length === batchSize) {
        keyRange = IDBKeyRange.lowerBound(records.at(-1).id, true);
        fetchEmployeesInBatch(store, batchSize, keyRange);
    }
};

//import { fetchBatchForward } from 'fetch-batch-fwd';
//fetchBatchForward = require('fetch-batch-fwd');

// Listen for messages from the main thread
self.addEventListener('message', event => {
    if (event.data) {

        const messageActionType = event.data.action;

        // Open the IndexedDB database
        const indexDbOpenRequest = indexedDB.open('employeeManagerDB', 1);

        // Handle the database open success event
        indexDbOpenRequest.onsuccess = function(event) {
            const db = event.target.result;

            // Start a transaction to access the object store
            const transaction = db.transaction(['employees'], 'readonly');
            const objectStore = transaction.objectStore('employees');

            switch (messageActionType)
            {
                case "fetch-batch-fwd":
                    fetchBatchForward(objectStore);
                    break;

                // TODO: add more cases based on fetch api
            }
        };

        // Handle errors in opening the database
        indexDbOpenRequest.onerror = function(event) {
            // Send an error message back to the main thread
            self.postMessage({ type: 'error', message: 'Error opening IndexedDB' });
        };
    }
});
