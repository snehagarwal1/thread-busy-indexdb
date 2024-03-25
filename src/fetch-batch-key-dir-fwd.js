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

// Export the function
export { fetchBatchKeyDirectionForward };