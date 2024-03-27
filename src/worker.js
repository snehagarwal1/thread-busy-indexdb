//-------GetAll() API for Batch retriving records in forward direction ------
//import { fetchBatchForward } from 'fetch-batch-fwd';
//fetchBatchForward = require('fetch-batch-fwd');

// Function to fetch records from IndexedDB asynchronously
function fetchBatchForward(store, batchSize) {
    fetchEmployeesInBatch(store, batchSize, null);
}

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

        // // Introduce a delay before fetching the next batch
        // setTimeout(() => {
        //     fetchMore(store, records, batchSize, keyRange);
        // }, 100); // 100ms delay
    };
}

function fetchMore(store, records, batchSize, keyRange) {
      if (records && records.length === batchSize) {
        keyRange = IDBKeyRange.lowerBound(records.at(-1).id, true);
        fetchEmployeesInBatch(store, batchSize, keyRange);
    }
};

//---------------------------------getAllKeys()------------------------------
// Function to fetch records from IndexedDB asynchronously

function fetchBatchKeyForward(store, batchSize) {

    triggerFetchEmployeesByKeysInBatch(store, batchSize, 1, null, null);
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

//-----------------------GetAllEntries('next')--------------------------------

function fetchBatchKeyDirectionForward(store, batchSize) {
    fetchEmployeesInBatchWithNewApi(store, batchSize, null, null);
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
        //console.log(records);

        // Post a message back to the main thread with the fetched records
        self.postMessage({ action: 'recordsFetched', records: records});

        fetchMoreWithNewApi(store, batchSize, keyRange, records);

        const end = performance.now();
        console.log(`getAllEntries('next'): Employees fetched
        in ${(end - start).toFixed(2)} milliseconds.`);
    }
}

//--------------------------OpenCursor() Reverse dir-------------------------
function fetchBatchReverse(store, batchSize) {
    fetchRecordsInBatchReverse(store, batchSize, null);
}

function fetchRecordsInBatchReverse(store, batchSize, keyRangeReverse) {
    const start = performance.now();

    let cursorRequest;
    let records = [];
    // Open a cursor with direction 'prev' to fetch records in reverse order
    cursorRequest = store.openCursor(keyRangeReverse, 'prev');

    cursorRequest.onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor && records.length < batchSize) {
            records.push(cursor.value);
            cursor.continue(); // Move to the previous record
        } else {
            self.postMessage({ action: 'recordsFetched', records: records});

            if (cursor) {
                // Update keyRangeReverse for the next batch
                keyRangeReverse = IDBKeyRange.upperBound(records.at(-1).id, true);

                // Fetch more records
                fetchRecordsInBatchReverse(store, batchSize, keyRangeReverse);

                const end = performance.now();
                console.log(`openCursor('prev'): Employees fetched
                in ${(end - start).toFixed(2)} milliseconds.`);
            } else {
                // log last fetched batches time.
                const end = performance.now();
                console.log(`openCursor('prev'): Employees fetched
                in ${(end - start).toFixed(2)} milliseconds.`);

                // No more records to fetch
                console.log('All records fetched in reverse order.');
            }
        }
    };
}

//-----------------------------getAllEntries('prev')-------------------------
function fetchBatchKeyDirectionReverse(store, batchSize) { 
    fetchRecordsInBatchWithNewApi(store, batchSize, null, null);
}

function fetchMoreInReverseWithNewApi(store, batchSize, keyRange, records) {
      if (records && records.length === batchSize) {
        keyRange = IDBKeyRange.upperBound(records.at(-1).key, true);
        fetchRecordsInBatchWithNewApi(store, batchSize, keyRange,records);
    }
};

function fetchRecordsInBatchWithNewApi(store, batchSize, keyRange, records) {
    const start = performance.now();
   
    store.getAllEntries(keyRange, batchSize, 'prev').onsuccess = e => {
        records = e.target.result;

        // Post a message back to the main thread with the fetched records
        self.postMessage({ action: 'recordsFetched', records: records});

        fetchMoreInReverseWithNewApi(store, batchSize, keyRange, records);

        const end = performance.now();
        console.log(`getAllEntries('prev'): Employees fetched
        in ${(end - start).toFixed(2)} milliseconds.`);
    }
}

//----------------------------OpenKeyCursor('prev')--------------------------
function fetchBatchKeyReverse(store, batchSize) {
    fetchRecordsInBatchByKeysReverse(store, batchSize, null, []);
} 

function fetchRecordsInBatchByKeysReverse(store, batchSize, keyRangeReverse, records) {
    const start = performance.now();

    let cursorRequest;

    // Open a cursor with direction 'prev' to fetch records in reverse order.
    cursorRequest = store.openKeyCursor(keyRangeReverse, 'prev');

    cursorRequest.onsuccess = function(event) {
        const cursor = event.target.result;
        if (cursor && records.length < batchSize) {

            store.get(cursor.primaryKey).onsuccess = function(event) {
                records.push(event.target.result);
                cursor.continue(); // Move to the previous record
            };

        } else {
            self.postMessage({ action: 'recordsFetched', records: records});

            if (cursor) {
                // Update keyRangeReverse for the next batch
                keyRangeReverse = IDBKeyRange.upperBound(records.at(-1).id, true);
                // Fetch more records
                fetchRecordsInBatchByKeysReverse(store, batchSize, keyRangeReverse, []);

                const end = performance.now();
                console.log(`openKeyCursor('prev'): Employees fetched
                in ${(end - start).toFixed(2)} milliseconds.`);
            } else {
                // log last fetched batches time.
                const end = performance.now();
                console.log(`openKeyCursor('prev'): Employees fetched
                in ${(end - start).toFixed(2)} milliseconds.`);

                // No more records to fetch
                console.log('All records fetched in reverse order.');
            }
        }
    };
}

//---------------------------Event Listener----------------------------------
// Listen for messages from the main thread
self.addEventListener('message', event => {
    if (event.data) {
        const messageData = event.data;
        const messageActionType = messageData.action;
        const batchSize = messageData.batchSize; // New batchSize parameter

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
                    fetchBatchForward(objectStore, batchSize);
                    break;
                
                case "fetch-batch-key-fwd":
                    fetchBatchKeyForward(objectStore, batchSize);
                    break;

                case "fetch-batch-key-direction-fwd":
                    fetchBatchKeyDirectionForward(objectStore, batchSize);
                    break;

                case "fetch-batch-reverse":
                    fetchBatchReverse(objectStore, batchSize);
                    break;
                
                case "fetch-batch-key-direction-reverse":
                    fetchBatchKeyDirectionReverse(objectStore, batchSize);
                    break;

                case "fetch-batch-key-reverse":
                    fetchBatchKeyReverse(objectStore, batchSize);
                    break;
            }
        };

        // Handle errors in opening the database
        indexDbOpenRequest.onerror = function(event) {
            // Send an error message back to the main thread
            self.postMessage({ type: 'error', message: 'Error opening IndexedDB' });
        };
    }
});
