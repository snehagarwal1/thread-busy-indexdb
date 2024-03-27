function fetchBatchKeyReverse(store, batchSize) {
    fetchRecordsInBatchByKeysReverse(store, batchSize, null, []);
} 

function fetchRecordsInBatchByKeysReverse(objectStore, batchSize, cursor, totalKeys) {
    // Open a key cursor at the end of the range (using 'prev' direction to iterate in reverse)
    const request = cursor ? cursor.continue(null, 'prev') : objectStore.openKeyCursor(null, 'prev');

    request.onerror = (event) => {
        console.error('Error opening key cursor:', event.target.error);
        // Handle the error here
    };

    request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            // Handle the key obtained from the cursor
            const key = cursor.key;
            console.log('Key:', key);

            // Continue to the next batch of keys
            if (totalKeys < batchSize) {

                // Post a message back to the main thread with the fetched records
                self.postMessage({ action: 'recordsFetched', records: records});

                fetchRecordsInBatchByKeysReverse(objectStore, batchSize, cursor, totalKeys + 1);
            }
        } else {
            // Finished iterating through all keys
            console.log('Total keys:', totalKeys);
        }
    };

}
    