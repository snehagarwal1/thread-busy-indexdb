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

export {fetchBatchReverse};

