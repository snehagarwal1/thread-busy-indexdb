
1. The goal of the demo is to test the performance of the old and new APIs when the UI thread is busy

2. The UI thread busyness is achieved by making the UI thread do some calculation for 10 seconds, 
   and introducing random intermittent breaks of 1-2 secs. These times can be modified as required within  the code. 

3. The UI thread posts the fetch task to the dedicated worker, and makes itself busy. 
   The worker processes the task s to fetch the records in batches parallelly. Each batch 
   fetch call is a separate transaction, so when the worker completes one transaction it 
   posts the result to the UI thread. 

4. The tasks completed is queued up in the UI thread for it to process them when it finds a free window. 
   When that happens all the results are loaded in bulk, and the console prints out the time taken 
   for each of them to complete. 

5. The console shows the cumulative time taken for all batches at the end.

HOW TO USE THE DEMO

1. Before beginning any fetching of records we need to first create the DB. Use the form provided to add
   the total number of employees/ records and the size of each record in kb. Select "Add Random Employees" .
   This should initialize the IDB. 
<img width="751" alt="Screenshot 2024-03-29 at 2 16 55 PM" src="https://github.com/snehagarwal1/thread-busy-indexdb/assets/103469166/c9698e48-94ce-4ecd-bca9-a388f8495bf2">

2. You can use the "delete all Employees" button to delete the DB and start a fresh one.
   
3. Refresh button is  a no op right now ( it can be removed or modified to refresh the page)

4. Add the batch size you wish to fetch using one of the buttons which would start the UI 
   thread busyness simulation.
   click on the api buttons you are interested in testing
      1.  fetch In batch fwd = getAll() 
      2.  fetch in batch by keys fwd = getAllKeys()
      3.  fetch in batch by keys and direction fwd = getAllEntries('next')
      4.  fetch in batch reverse = OpenCursor('prev')
      5.  fetch in Batch by keys reverse = OpenKeyCursor('prev')
      6.  fetch in batch by key and direction reverse = getAllEntries('prev')
<img width="1004" alt="Screenshot 2024-03-29 at 2 20 46 PM" src="https://github.com/snehagarwal1/thread-busy-indexdb/assets/103469166/9eb7a7a7-e789-4540-8a7d-fc7f4e7d702c">


5. Check the console to see the cumulative time taken to return all the records.
  
<img width="1009" alt="Screenshot 2024-03-29 at 2 48 04 PM" src="https://github.com/snehagarwal1/thread-busy-indexdb/assets/103469166/2cda7f11-4809-43a4-83e9-2dc8f914bba8">
