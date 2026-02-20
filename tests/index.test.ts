
import { describe, it, expect } from 'bun:test';
import { APP_VERSION, BRIDGE_STATUS, SYSTEM_ARCH } from "../index.ts";

describe('index.ts Parity Check', () => {
    it('should export version and status', () => {
        expect(APP_VERSION).toBeDefined();
        expect(BRIDGE_STATUS).toBeDefined();
        expect(SYSTEM_ARCH).toBeDefined();
    });
});
