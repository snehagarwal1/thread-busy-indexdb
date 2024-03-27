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

export {fetchBatchKeyReverse};