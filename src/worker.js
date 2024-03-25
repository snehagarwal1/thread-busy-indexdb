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


//-----------GetAllKeys()------------------------------------------------------
// Function to fetch records from IndexedDB asynchronously
function fetchBatchKeyForward(store) {

    triggerFetchEmployeesByKeysInBatch(store, 10, 1, null, null);
}

function triggerFetchEmployeesByKeysInBatch(store, batchSize, keyStart, keys, records) {
    
    keyRangeInitial = IDBKeyRange.lowerBound(keyStart, false);
    fetchEmployeesByKeysInBatch(store, batchSize, keyRangeInitial, keys, records);
}

function fetchMoreByKeys(store, keys, batchSize, keyRangeForBatch, records) {
  // If there could be more results, fetch them
  if (keys && records && records.length === batchSize) {

    // Find keys greater than the last key
    keyRangeForBatch = IDBKeyRange.lowerBound(keys.at(-1), true);

    keys = records = undefined; // reset keys and values for next batch
    fetchEmployeesByKeysInBatch(store, batchSize, keyRangeForBatch, keys, records);
  }
}
 
function fetchEmployeesByKeysInBatch(store, batchSize, keyRangeForBatch, keys, records) {
    const start = performance.now();
    
    store.getAllKeys(keyRangeForBatch, batchSize).onsuccess = e => {
        keys = e.target.result;

        fetchMoreByKeys(store, keys, batchSize, keyRangeForBatch, records);
  }
  // gets the records/values associated with the keys.
  store.getAll(keyRangeForBatch, batchSize).onsuccess = e => {
    records = e.target.result;

    // Post a message back to the main thread with the fetched records
    self.postMessage({ action: 'recordsFetched', records: records});
    fetchMoreByKeys(store, keys, batchSize, keyRangeForBatch, records);

    const end = performance.now();
    console.log(`getAllKeys: Employees fetched
    in ${(end - start).toFixed(2)} milliseconds.`);
  }
}

//-----------------GetAllEntries()----------------------------------

function fetchBatchKeyDirectionForward(store) {
    fetchEmployeesInBatchWithNewApi(store, 10, null, null);
}

function fetchMoreWithNewApi(store, batchSize, keyRange, records) {
    if (records && records.length === batchSize) {
        keyRange = IDBKeyRange.lowerBound(records.at(-1).key, true);
        fetchEmployeesInBatchWithNewApi(store, batchSize, keyRange, records);
    }
};

function fetchEmployeesInBatchWithNewApi(store, batchSize, keyRange, records) {
    const start = performance.now(); 
    
    store.getAllEntries(keyRange, batchSize, 'next').onsuccess = e => {
        records = e.target.result;
        console.log(records);
        // Post a message back to the main thread with the fetched records
        self.postMessage({ action: 'recordsFetched', records: records});

        fetchMoreWithNewApi(store, batchSize, keyRange, records);

        const end = performance.now();
        console.log(`getAllEntries('next'): Employees fetched
        in ${(end - start).toFixed(2)} milliseconds.`);
    }
}


//---------------------------Event Listener------------------------------------
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
                
                case "fetch-batch-key-fwd":
                    fetchBatchKeyForward(objectStore);
                    break;

                case "fetch-batch-key-direction-fwd":
                    fetchBatchKeyDirectionForward(objectStore);
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
