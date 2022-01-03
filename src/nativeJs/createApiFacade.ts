export type Method =
	| "get"
	| "GET"
	| "delete"
	| "DELETE"
	| "head"
	| "HEAD"
	| "options"
	| "OPTIONS"
	| "post"
	| "POST"
	| "put"
	| "PUT"
	| "patch"
	| "PATCH"
	| "link"
	| "LINK"
	| "unlink"
	| "UNLINK"

/**
 * Create a facade for 'fetch', providing an axios like interface.
 *
 * Caller can configure the facade by providing the 'config' argument:
 *   - 'baseUrl': prepends all calls to 'api' with 'baseUrl'.
 *   - 'ownFetch': use this implementation instead of native fetch.
 */
const createApiFacade = (config: {
	baseUrl?: string
	ownFetch?: typeof fetch
}) =>
	async function api(
		url: string,
		data?: object | FormData,
		method?: Method,
		ignoreBaseUrl?: boolean // if true, ignore 'baseUrl' and only use 'url'
	): Promise<Response> {
		const isFormData = data instanceof FormData

		const bodyFormattedData = () => {
			if (isFormData) {
				return data as FormData
			} else {
				return JSON.stringify(data)
			}
		}

		const fetchMethod = config.ownFetch || fetch

		const fetchReq = () => {
			const contentTypeHeaderObj = isFormData
				? {} // fetch api applies boundary for multipart/form-data
				: { "Content-Type": "application/json" }

			return fetchMethod(
				`${
					config.baseUrl && !ignoreBaseUrl ? config.baseUrl : ""
				}${url}`,
				{
					headers: {
						...contentTypeHeaderObj
					},
					method: method ? method : data ? "POST" : "GET",
					body: data ? bodyFormattedData() : null
				}
			)
		}

		const resp = await fetchReq()

		return resp
	}

export default createApiFacade
