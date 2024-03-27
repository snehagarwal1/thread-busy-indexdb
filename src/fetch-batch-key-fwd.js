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

// Export the function
export { fetchBatchKeyForward };
