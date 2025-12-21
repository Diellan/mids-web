// Converted from C# ShareClient.cs
// Note: RestSharp is C# specific. In TypeScript/Web, we use the native fetch API.

import type { BuildRecordDto } from './RestModels/BuildRecordDto';
import type { FetchResult } from './RestModels/FetchResult';
import type { OperationResult, OperationResultT } from './RestModels/OperationResult';
import type { SchemaData } from './RestModels/SchemaData';
import type { TransactionResult } from './RestModels/TransactionResult';
import { OperationResult as OperationResultClass, OperationResultT as OperationResultTClass } from './RestModels/OperationResult';
import { TransactionResult as TransactionResultClass } from './RestModels/TransactionResult';
import { FetchResult as FetchResultClass } from './RestModels/FetchResult';

export class ShareClient {
    private static readonly BaseUrl: string = 'https://api.midsreborn.com';
    private static readonly Timeout: number = 30000; // 30 seconds

    private static async Request<T>(endpoint: string, method: string = 'GET', body?: any): Promise<T> {
        const url = `${ShareClient.BaseUrl}/${endpoint}`;
        const options: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            signal: AbortSignal.timeout(ShareClient.Timeout),
        };

        if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json() as T;
        } catch (error: any) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    }

    static async SubmitBuild(buildDto: BuildRecordDto): Promise<OperationResultT<TransactionResult>> {
        try {
            const response = await ShareClient.Request<OperationResultT<TransactionResult>>('build/submit', 'POST', buildDto);
            if (response.IsSuccessful) {
                return {
                    IsSuccessful: response.IsSuccessful,
                    Data: response.Data,
                    Message: response.Message
                };
            } else {
                return {
                    IsSuccessful: response.IsSuccessful,
                    Message: response.Message ?? 'Error connecting to server or malformed response.'
                };
            }
        } catch (e: any) {
            return {
                IsSuccessful: false,
                Message: `Exception occurred: ${e.message}`
            };
        }
    }

    static async UpdateBuild(buildDto: BuildRecordDto, id: string): Promise<OperationResultT<TransactionResult>> {
        try {
            const response = await ShareClient.Request<OperationResultT<TransactionResult>>(`build/update/${id}`, 'PATCH', buildDto);
            if (response.IsSuccessful) {
                return {
                    IsSuccessful: response.IsSuccessful,
                    Data: response.Data,
                    Message: response.Message
                };
            } else {
                return {
                    IsSuccessful: response.IsSuccessful,
                    Message: response.Message ?? 'Error connecting to server or malformed response.'
                };
            }
        } catch (e: any) {
            return {
                IsSuccessful: false,
                Message: `Exception occurred: ${e.message}`
            };
        }
    }

    static async RefreshShare(id: string): Promise<OperationResultT<TransactionResult>> {
        try {
            const response = await ShareClient.Request<OperationResultT<TransactionResult>>(`build/${id}/refresh`, 'PATCH');
            if (response.IsSuccessful) {
                return {
                    IsSuccessful: response.IsSuccessful,
                    Data: response.Data,
                    Message: response.Message
                };
            } else {
                return {
                    IsSuccessful: response.IsSuccessful,
                    Message: response.Message ?? 'Error connecting to server or malformed response.'
                };
            }
        } catch (e: any) {
            return {
                IsSuccessful: false,
                Message: `Exception occurred: ${e.message}`
            };
        }
    }

    static async FetchData(id: string): Promise<OperationResultT<FetchResult>> {
        try {
            const response = await ShareClient.Request<OperationResultT<FetchResult>>(`build/${id}/fetch`);
            if (response.IsSuccessful) {
                return {
                    IsSuccessful: response.IsSuccessful,
                    Data: response.Data,
                    Message: response.Message
                };
            } else {
                return {
                    IsSuccessful: response.IsSuccessful,
                    Message: response.Message ?? 'Error connecting to server or malformed response.'
                };
            }
        } catch (e: any) {
            return {
                IsSuccessful: false,
                Message: `Exception occurred: ${e.message}`
            };
        }
    }

    static async GetBuild(code: string): Promise<SchemaData | null> {
        try {
            const importResponse = await ShareClient.Request<SchemaData>(`build/${code}`);
            return importResponse;
        } catch (e: any) {
            console.error('Failed to get build:', e);
            return null;
        }
    }
}

