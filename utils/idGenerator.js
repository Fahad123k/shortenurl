class Snowflake {
    constructor({ datacenterId = 1n, workerId = 1n, epoch = 1609459200000n } = {}) {
        this.datacenterId = BigInt(datacenterId) & 0x1Fn;
        this.workerId = BigInt(workerId) & 0x1Fn;
        this.sequence = 0n;
        this.lastTimestamp = -1n;
        this.epoch = BigInt(epoch);
    }

    currentTime() { return BigInt(Date.now()); }

    nextId() {
        let ts = this.currentTime();
        if (ts < this.lastTimestamp) {
            ts = this.lastTimestamp + 1n;
        }
        if (ts === this.lastTimestamp) {
            this.sequence = (this.sequence + 1n) & 0xFFFn;
            if (this.sequence === 0n) {
                while (ts <= this.lastTimestamp) ts = this.currentTime();
            }
        } else {
            this.sequence = 0n;
        }
        this.lastTimestamp = ts;

        const id = ((ts - this.epoch) << 22n) |
            (this.datacenterId << 17n) |
            (this.workerId << 12n) |
            this.sequence;
        return id.toString();
    }
}

module.exports = new Snowflake({ datacenterId: 1n, workerId: 1n });