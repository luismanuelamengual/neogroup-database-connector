import {DataSource} from './data-source';

export abstract class DataSources {

    private static sources = new Map<string, DataSource>();
    
    public static register(sourceName: string, source: DataSource) {
        this.sources.set(sourceName, source);
    }

    public static get(sourceName: string): DataSource {
        return this.sources.get(sourceName);
    }

    public static has(sourceName: string): boolean {
        return this.sources.has(sourceName);
    }

    public static getAll(): Array<DataSource> {
        return Array.from(this.sources.values());
    }

    public static size(): number {
        return this.sources.size;
    }
}
