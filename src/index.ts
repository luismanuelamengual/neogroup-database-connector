require('./data-source');

const sources = new Map<string, DataSource>();

exports.registerSource = (sourceName: string, source: DataSource) => sources.set(sourceName, source);

exports.getSource = (sourceName: string): DataSource => sources.get(sourceName);
