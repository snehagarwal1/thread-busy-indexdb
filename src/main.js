// Event listener for start button
document.getElementById('fetch-batch-fwd').addEventListener('click', (event) => {
    const buttonId = event.target.id;
    const batchSize = parseInt(document.getElementById('batchSize').value);
    simulateUiThreadBusy(buttonId, batchSize);
});

document.getElementById('fetch-batch-key-fwd').addEventListener('click', (event) => {
    const buttonId = event.target.id;
    const batchSize = parseInt(document.getElementById('batchSize').value);
    simulateUiThreadBusy(buttonId, batchSize);
});

document.getElementById('fetch-batch-key-direction-fwd').addEventListener('click', (event) => {
    const buttonId = event.target.id;
    const batchSize = parseInt(document.getElementById('batchSize').value);
    simulateUiThreadBusy(buttonId, batchSize);
});

document.getElementById('fetch-batch-reverse').addEventListener('click', (event) => {
    const buttonId = event.target.id;
    const batchSize = parseInt(document.getElementById('batchSize').value);
    simulateUiThreadBusy(buttonId, batchSize);
});

document.getElementById('fetch-batch-key-direction-reverse').addEventListener('click', (event) => {
    const buttonId = event.target.id;
    const batchSize = parseInt(document.getElementById('batchSize').value);
    simulateUiThreadBusy(buttonId, batchSize);
});

document.getElementById('fetch-batch-key-reverse').addEventListener('click', (event) => {
    const buttonId = event.target.id;
    const batchSize = parseInt(document.getElementById('batchSize').value);
    simulateUiThreadBusy(buttonId, batchSize);
});

// Function to simulate UI thread busyness
function simulateUiThreadBusy(buttonId, batchSize) {
    console.log('Simulating UI thread busyness...');

    // Start the dedicated worker to fetch records
    const worker = new Worker('src/worker.js');

    // Listen for messages from the worker
    worker.addEventListener('message', event => {
        if (event.data && event.data.action === 'recordsFetched') {
            console.log("UI Thread: Received fetched record batch from Worker.");
            // Handle fetched records
            switch (buttonId) {
                case "fetch-batch-fwd":
                case "fetch-batch-key-fwd":
                case "fetch-batch-reverse":
                case "fetch-batch-key-reverse":
                    displayFetchedRecordsFromWorker(event.data.records);
                    break;
                
                case "fetch-batch-key-direction-fwd":
                case "fetch-batch-key-direction-reverse":
                    displayFetchedRecordsByKeysFromWorker(event.data.records);
            }
        }
    });

    console.log(`Post Message to Worker to begin fetching records from IndexedDB. Fetch API Type: ${buttonId}`);
    
    // Note: buttonId is the same as the fetch api type to be used.
    worker.postMessage({ action: buttonId, batchSize: batchSize});

    const startTime = performance.now();
    const totalRunTime = 10000; // 10 secs
    const breakDuration = 100; // 100 ms

    // Schedule a task to keep the UI thread busy
    scheduler.postTask(() => {
        doFakeCalculation(totalRunTime, startTime, breakDuration);
    });
}

function doFakeCalculation(totalRunTime, startTime, breakDuration) {
        // Display "started" status
        document.getElementById('fake-calculation-task-status').textContent = 'UI Thread Busy: Task Started';
        // Simulate fake calculation task
        console.log('UI thread is now busy.');

        // generates random number between 1 to 2 seconds
        const busyTimeBeforeBreak = Math.random() * 1000 + 1000;
        const resetStartTime = performance.now(); 

        while ((performance.now() - startTime) < 10000) {
            
            if (performance.now() - resetStartTime  >= busyTimeBeforeBreak)
            {
                console.log(`Should break`);
                // Call again after "breakdDuration"
                setTimeout(() => {
                    doFakeCalculation(totalRunTime, startTime, breakDuration)
                }, 
                breakDuration);

                break;
            }

        }
        console.log('UI thread is now free.');
        // Display "completed" status
        document.getElementById('fake-calculation-task-status').textContent = 'UI Thread Busy: Task Completed';
}

// Function to display fetched records
function displayFetchedRecordsFromWorker(records) {
    const recordsList = document.getElementById('records-list');
    records.forEach(employee => {
        const listItem = document.createElement('div');
        listItem.textContent = `${employee.id} -${employee.name} - ${employee.job} - ${employee.employer}`;
        recordsList.appendChild(listItem);
    });

    const li = document.createElement('li');
    li.textContent = "------------------ Batch End ------------------";;
  
    // Append the list item to the employee list container
    recordsList.appendChild(li);
}

function displayFetchedRecordsByKeysFromWorker(records) {
    const recordsList = document.getElementById('records-list');
  
    records.forEach(employee => {
      const listItem = document.createElement('div');
      listItem.textContent = `${employee.key} - ${employee.value.name} - ${employee.value.job} - ${employee.value.employer}`;
      recordsList.appendChild(listItem);
    });
  
    const li = document.createElement('li');
    li.textContent = "------------------ Batch End ------------------";;
  
    // Append the list item to the employee list container
    recordsList.appendChild(li);
}

//=================================================================

let db;
const request = indexedDB.open('employeeManagerDB', 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    let objectStore;
    if (!db.objectStoreNames.contains('employees')) {
        objectStore = db.createObjectStore('employees', {keyPath: 'id', 
        autoIncrement: true});
    } else {
        objectStore = request.transaction.objectStore('employees');
    }
    objectStore.createIndex('name', 'name', {unique: false});
    objectStore.createIndex('job', 'job', {unique: false});
    objectStore.createIndex('employer', 'employer', {unique: false});
    objectStore.createIndex('salary', 'salary', {unique: false});
};

request.onsuccess = function(event) {
    db = event.target.result;
    fetchEmployees();
};

request.onerror = function(event) {
    console.error('Database error: ', event.target.error);
};

function fetchEmployees() {
    const start = performance.now();
    const transaction = db.transaction(['employees'], 'readonly');
    const store = transaction.objectStore('employees');
    const request = store.getAll();

    request.onsuccess = function(event) {
        const employees = event.target.result;
        const employeeList = document.getElementById('allEmployees');
        // Clear the employee list before populating with new data
        employeeList.innerHTML = '';
        employees.forEach(employee => {
            const li = document.createElement('li');
            li.textContent = `${employee.id} -${employee.name} - 
            ${employee.job} - ${employee.employer} - ${employee.salary}`;
            employeeList.appendChild(li);
        });

        const end = performance.now();
        document.getElementById('performance').textContent = `employees loaded 
        in ${(end - start).toFixed(2)} milliseconds.`;

        request.onerror = function(event) {
            console.error('Fetch employees error: ', event.target.error);
    };
}
}

function generateRandomData(sizeInBytes) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomData = '';
    
    for (let i = 0; i < sizeInBytes; i++) {
        randomData += characters.charAt(Math.floor(Math.random() * 
        characters.length));
    }
    
    return randomData;
}

// Function to add records to the database based on user input of size in kb/ record and record number.
function addRandomEmployees() {
    const start = performance.now();
    const transaction = db.transaction(['employees'], 'readwrite');
    const objectStore = transaction.objectStore('employees');

    const randomCount = parseInt(document.getElementById('randomCount').value) 
    || 1;
    let recordSize = parseInt(document.getElementById('recordSize').value);
    // convert user input to KB
    recordSize = recordSize * 1024; // KB to bytes
    let totalRecordSize = 0;

    // Get the progress bar element
    const progressBar = document.getElementById('progressBar');

    for (let i = 0; i < randomCount; i++) {
        const randomData = generateRandomData(recordSize);
        const employee = {
            name: 'Random Name',
            job: 'Random Job',
            employer: 'Random Employer',
            salary: 50000, // Random salary or any default value
            data: randomData // This makes up for the record size input by the user.
        };
        objectStore.add(employee);
        totalRecordSize += recordSize; // Add the size of the current record to the total

        // Calculate total size in MB after transaction completes
        const totalRecordSizeMB = totalRecordSize / (1024 * 1024); // convert to MB
        document.getElementById('totalRecordSize').textContent = `Total size 
        of the DB using ${recordSize / 1024} KB per record is: 
        ${totalRecordSizeMB.toFixed(2)} MB`;
    }

    transaction.oncomplete = function() {
        console.log('Records added successfully.');
        console.log(`${randomCount} records added successfully.`);
        console.log(`Total database size: ${totalRecordSize * randomCount} bytes`);
        fetchEmployees();
    };

    const end = performance.now();
    document.getElementById('performance').textContent = `employees loaded 
    in ${(end - start).toFixed(2)} milliseconds.`;

    transaction.onerror = function(event) {
        console.error('Error adding records:', event.target.error);
    };
}

function clearPerformanceAndSizeData() {
    const performance= document.getElementById('performance');
    performance.innerHTML = ''; // Clear the performance list
    console.log('performance cleared.');

    const totalRecordSize= document.getElementById('totalRecordSize');
    totalRecordSize.innerHTML = ''; // Clear the totalRecordSize list
    console.log('totalRecordSize cleared.');
}

function deleteAllEmployees() {
    const start = performance.now();
    const transaction = db.transaction(['employees'], 'readwrite');
    const store = transaction.objectStore('employees');
    // Clears all employees from the store.
    store.clear(); 

    transaction.oncomplete = function() {
        console.log('All employees deleted.');
        // Update the UI after deleting all employees.
        fetchEmployees(); 

        const end = performance.now();
        document.getElementById('performance').textContent = `All employees 
        deleted in ${(end - start).toFixed(2)} milliseconds.`;
    };

    transaction.onerror = function(event) {
        console.error('Transaction error: ', event.target.error);
    };
}

function clearEmployeeList() {
    const employeeList = document.getElementById('employeeList');
    employeeList.innerHTML = ''; // Clear the employee list
    console.log('Employee list cleared.');
}
