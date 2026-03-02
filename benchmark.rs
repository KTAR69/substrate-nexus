use std::time::Instant;

fn main() {
    let iterations = 100_000;

    // Simulate O(N) array copy operations
    let start = Instant::now();
    for _ in 0..iterations {
        let mut storage = Vec::new(); // simulating a deep read
        for i in 0..100 {
            let mut clone = storage.clone(); // simulating deep copy on mutate
            clone.push(i);
            storage = clone;
        }
    }
    let duration_vec = start.elapsed();

    // Simulate O(1) independent insertions
    let start = Instant::now();
    for _ in 0..iterations {
        let mut count = 0; // simulating read count
        for i in 0..100 {
            let _insert = i; // simulating insert into double map
            count += 1;
        }
    }
    let duration_map = start.elapsed();

    println!("Simulated O(N) Vector copy updates took: {:?}", duration_vec);
    println!("Simulated O(1) DoubleMap style updates took: {:?}", duration_map);
    println!("Improvement factor: {:.2}x", duration_vec.as_micros() as f64 / duration_map.as_micros() as f64);
}
