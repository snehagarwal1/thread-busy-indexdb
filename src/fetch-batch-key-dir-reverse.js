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
        console.log(records);

        // Post a message back to the main thread with the fetched records
        self.postMessage({ action: 'recordsFetched', records: records});

        fetchMoreInReverseWithNewApi(store, batchSize, keyRange, records);

        const end = performance.now();
        console.log(`getAllEntries('prev'): Employees fetched
        in ${(end - start).toFixed(2)} milliseconds.`);
    }
}

export { fetchBatchKeyDirectionReverse } ; 