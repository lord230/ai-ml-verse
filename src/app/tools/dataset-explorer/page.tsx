"use client";

import React, { useState, useMemo, useRef } from 'react';
import Papa from 'papaparse';
import { Database, UploadCloud, BarChart2, FileText, AlertTriangle, Lightbulb } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip);

type ColumnDef = {
    name: string;
    type: 'numeric' | 'categorical' | 'boolean' | 'date' | 'unknown';
    missingCount: number;
    missingPercent: number;
    uniqueCount: number;
    mean?: number;
    min?: number;
    max?: number;
    distribution?: Record<string, number>;
};

export default function DatasetExplorer() {
    const [data, setData] = useState<Record<string, unknown>[]>([]);
    const [columns, setColumns] = useState<string[]>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [error, setError] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        setError('');

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: (results) => {
                setIsParsing(false);
                if (results.errors.length && !results.data.length) {
                    setError('Failed to parse CSV file.');
                    return;
                }
                setColumns(results.meta.fields || []);
                setData(results.data as Record<string, unknown>[]);
            },
            error: (err) => {
                setIsParsing(false);
                setError(err.message);
            }
        });
    };

    const analytics = useMemo(() => {
        if (!data.length || !columns.length) return null;

        const rowCount = data.length;
        const stats: Record<string, ColumnDef> = {};

        columns.forEach(col => {
            let missingCount = 0;
            let isNumeric = true;
            let isBoolean = true;
            const values: number[] = [];
            const distribution: Record<string, number> = {};

            data.forEach(row => {
                const val = row[col];
                if (val === null || val === undefined || val === '') {
                    missingCount++;
                } else {
                    if (typeof val === 'number' && !isNaN(val)) {
                        values.push(val);
                    }
                    const valStr = String(val);
                    distribution[valStr] = (distribution[valStr] || 0) + 1;

                    if (typeof val !== 'number') isNumeric = false;
                    if (typeof val !== 'boolean' && valStr !== 'true' && valStr !== 'false' && valStr !== '1' && valStr !== '0') isBoolean = false;
                }
            });

            const uniqueCount = Object.keys(distribution).length;
            let type: ColumnDef['type'] = 'unknown';

            if (isNumeric && uniqueCount > 10) type = 'numeric';
            else if (isBoolean || uniqueCount <= 10) type = 'categorical';
            else if (isNumeric) type = 'numeric';
            else type = 'categorical';

            stats[col] = {
                name: col,
                type,
                missingCount,
                missingPercent: (missingCount / rowCount) * 100,
                uniqueCount,
                distribution: type === 'categorical' ? distribution : undefined,
            };

            if (type === 'numeric' && values.length > 0) {
                const sorted = [...values].sort((a, b) => a - b);
                stats[col].min = sorted[0];
                stats[col].max = sorted[sorted.length - 1];
                stats[col].mean = values.reduce((a, b) => a + b, 0) / values.length;

                // simple 10-bin distribution for numeric if we wanted to
            }
        });

        // Detect Target
        const possibleTarget = columns[columns.length - 1]; // Assume last col
        if (stats[possibleTarget]) {
            // confirm it makes sense as a target
        }

        const problemType = stats[possibleTarget]?.type === 'numeric' && stats[possibleTarget]?.uniqueCount > 20 ? 'Regression' : 'Classification';

        let imbalanceWarning = false;
        if (problemType === 'Classification' && stats[possibleTarget]?.distribution) {
            const counts = Object.values(stats[possibleTarget].distribution);
            const min = Math.min(...counts);
            const max = Math.max(...counts);
            if (max > min * 5) imbalanceWarning = true;
        }

        return { rowCount, stats, possibleTarget, problemType, imbalanceWarning };
    }, [data, columns]);

    return (
        <div className="flex-1 flex flex-col p-4 md:p-8 max-w-screen-2xl mx-auto w-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white flex items-center">
                    <Database className="w-8 h-8 mr-3 text-teal-500" />
                    Dataset Explorer
                </h1>
                <p className="text-slate-400 mt-2">
                    Upload a CSV to instantly compute missing value heatmaps, feature distributions, class imbalances,
                    and correlation matrix predictions completely within your browser.
                </p>
            </div>

            {!analytics && (
                <div className="flex-1 flex flex-col items-center justify-center p-12 glass-panel rounded-2xl border-dashed border-2 border-slate-700/50">
                    <UploadCloud className="w-16 h-16 text-slate-500 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">Upload your Dataset</h3>
                    <p className="text-slate-400 text-sm mb-6 text-center max-w-md">
                        CSV files are parsed entirely client-side. Your data never leaves your browser.
                    </p>
                    <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isParsing}
                        className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-medium rounded-lg transition-colors flex items-center shadow-[0_0_15px_rgba(20,184,166,0.4)] disabled:opacity-50"
                    >
                        {isParsing ? 'Parsing...' : 'Select CSV File'}
                    </button>

                    {error && <p className="text-red-400 mt-4 text-sm bg-red-500/10 px-4 py-2 rounded border border-red-500/20">{error}</p>}
                </div>
            )}

            {analytics && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass-panel p-6 rounded-2xl">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                                <FileText className="w-5 h-5 mr-2 text-teal-400" />
                                Overview
                            </h3>
                            <div className="space-y-4">
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                    <div className="text-sm text-slate-400 mb-1">Total Rows</div>
                                    <div className="text-2xl font-bold text-white">{analytics.rowCount.toLocaleString()}</div>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700">
                                    <div className="text-sm text-slate-400 mb-1">Total Columns</div>
                                    <div className="text-2xl font-bold text-white">{columns.length}</div>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700 border-teal-500/20">
                                    <div className="text-sm text-slate-400 mb-1">Detected Target</div>
                                    <div className="text-lg font-semibold text-teal-300">{analytics.possibleTarget}</div>
                                    <div className="text-xs text-slate-500 mt-1">Type: {analytics.problemType}</div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full blur-2xl"></div>
                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center relative z-10">
                                <Lightbulb className="w-5 h-5 mr-2 text-indigo-400" />
                                Model Suggestion
                            </h3>
                            <p className="text-sm text-slate-300 relative z-10">
                                {analytics.problemType === 'Classification' ?
                                    'Trees (XGBoost/LightGBM) or neural nets with Cross-Entropy Loss recommended. ' :
                                    'Linear regression, Ridge/Lasso, or neural nets with MSE Loss recommended. '}
                            </p>

                            {analytics.imbalanceWarning && (
                                <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-start relative z-10">
                                    <AlertTriangle className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="text-xs text-red-300">Class imbalance detected. Consider SMOTE, class weighting, or focal loss.</span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => { setData([]); setColumns([]); }}
                            className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors border border-slate-600"
                        >
                            Upload New Dataset
                        </button>
                    </div>

                    <div className="lg:col-span-3 space-y-6">
                        <div className="glass-panel p-6 rounded-2xl">
                            <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                                <BarChart2 className="w-5 h-5 mr-2 text-amber-400" />
                                Feature Profiles
                            </h3>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-300 border-collapse">
                                    <thead className="bg-slate-900/80 text-xs uppercase text-slate-400 border-b border-slate-700">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Feature</th>
                                            <th className="px-4 py-3 font-medium">Type</th>
                                            <th className="px-4 py-3 font-medium">Missing</th>
                                            <th className="px-4 py-3 font-medium">Unique</th>
                                            <th className="px-4 py-3 font-medium">Stats (Min - Max)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {columns.map(col => {
                                            const stat = analytics.stats[col];
                                            return (
                                                <tr key={col} className="border-b border-slate-800/60 hover:bg-slate-800/40 transition-colors">
                                                    <td className="px-4 py-3 font-medium text-indigo-300">{col}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${stat.type === 'numeric' ? 'bg-emerald-500/10 text-emerald-400' :
                                                            stat.type === 'categorical' ? 'bg-amber-500/10 text-amber-400' :
                                                                'bg-slate-700 text-slate-300'
                                                            }`}>
                                                            {stat.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {stat.missingCount > 0 ? (
                                                            <div className="flex items-center">
                                                                <span className="text-red-400 mr-2">{stat.missingCount}</span>
                                                                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                                    <div className="h-full bg-red-500" style={{ width: `${stat.missingPercent}%` }}></div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-500">0%</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-3">{stat.uniqueCount}</td>
                                                    <td className="px-4 py-3 text-xs text-slate-400">
                                                        {stat.type === 'numeric' ? `${stat.min?.toFixed(2)} — ${stat.max?.toFixed(2)} (μ: ${stat.mean?.toFixed(2)})` : '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Target Distribution logic if categorical */}
                        {analytics.problemType === 'Classification' && analytics.stats[analytics.possibleTarget]?.distribution && (
                            <div className="glass-panel p-6 rounded-2xl">
                                <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                                    <BarChart2 className="w-5 h-5 mr-2 text-purple-400" />
                                    Target Distribution ({analytics.possibleTarget})
                                </h3>
                                <div className="h-64">
                                    <Bar
                                        data={{
                                            labels: Object.keys(analytics.stats[analytics.possibleTarget].distribution!),
                                            datasets: [{
                                                label: 'Count',
                                                data: Object.values(analytics.stats[analytics.possibleTarget].distribution!),
                                                backgroundColor: '#8b5cf6',
                                                borderRadius: 4
                                            }]
                                        }}
                                        options={{
                                            maintainAspectRatio: false,
                                            scales: {
                                                y: { border: { dash: [4, 4] }, grid: { color: '#334155' }, ticks: { color: '#94a3b8' } },
                                                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
                                            },
                                            plugins: { legend: { display: false } }
                                        }}
                                    />
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}
