document.addEventListener('DOMContentLoaded', () => {
    // Mock Block Height Update
    const blockHeightElement = document.getElementById('block-height');
    let currentHeight = 12456789;

    setInterval(() => {
        currentHeight++;
        blockHeightElement.innerText = `#${currentHeight.toLocaleString()}`;
    }, 6000); // 6s block time

    // Mock Audit Log Update
    const auditLog = document.getElementById('audit-log');

    const messages = [
        "Verifying Consultant [5Grw...]",
        "KMS Signature Verified.",
        "Coretime Renewed (1000 UNIT).",
        "XCM Message Received from ParaID 2000.",
        "Consultant Registered: Alice."
    ];

    setInterval(() => {
        const msg = messages[Math.floor(Math.random() * messages.length)];
        const time = new Date().toLocaleTimeString('en-US', { hour12: false });

        const entry = document.createElement('div');
        entry.className = 'flex gap-2 text-gray-500 font-mono text-xs';
        entry.innerHTML = `<span>[${time}]</span><span class="text-white">${msg}</span>`;

        auditLog.prepend(entry);

        if (auditLog.children.length > 5) {
            auditLog.lastElementChild.remove();
        }
    }, 4500);
});
