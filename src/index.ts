import {DataSource} from './data-source';

const sources = new Map<string, DataSource>();

export const registerSource = (sourceName: string, source: DataSource) => sources.set(sourceName, source);

export const getSource = (sourceName: string): DataSource => sources.get(sourceName);
