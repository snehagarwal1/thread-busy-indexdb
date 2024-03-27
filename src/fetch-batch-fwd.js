// Function to fetch records from IndexedDB asynchronously
function fetchBatchForward(store, batchSize) {
    let totalFetchTime = 0;
    fetchEmployeesInBatch(store, batchSize, null, totalFetchTime);
}

//-------GetAll() API for Batch retriving records in forward direction ----------

function fetchEmployeesInBatch(store, batchSize, keyRange, totalFetchTime) {
    const start = performance.now();
    store.getAll(keyRange, batchSize).onsuccess = e => {
        const records = e.target.result;

        // Post a message back to the main thread with the fetched records
        self.postMessage({ action: 'recordsFetched', records: records });

        fetchMore(store, records, batchSize, keyRange);

        const end = performance.now();
        totalFetchTime += end - start;

        console.log(`Worker: Employees batch of ${batchSize} fetched
            in ${(end - start).toFixed(2)} ms. Total Fetch time: ${totalFetchTime}ms`);
    };
}

function fetchMore(store, records, batchSize, keyRange, totalFetchTime) {
      if (records && records.length === batchSize) {
        keyRange = IDBKeyRange.lowerBound(records.at(-1).id, true);
        fetchEmployeesInBatch(store, batchSize, keyRange, totalFetchTime);
    }
};

// Export the function
export { fetchBatchForward };
