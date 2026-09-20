export interface AiToolDefinition {
  name: string
  description: string
  requiredPermissions: string[]
  requiresApproval: boolean
}

export interface AiProposedAction {
  toolName: string
  summary: string
  requiresApproval: boolean
  arguments: Record<string, unknown>
}

export interface AiCommandResponse {
  status: 'ok' | 'provider_not_configured' | string
  message: string
  availableTools: AiToolDefinition[]
  proposedAction?: AiProposedAction | null
  model?: string | null
}

export class AiAssistantApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message)
  }
}

const configuredApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '')

export const isAiApiConfigured = Boolean(configuredApiBaseUrl)

const readErrorMessage = async (response: Response) => {
  const text = await response.text().catch(() => '')
  return text || `AI request failed with status ${response.status}`
}

export const runAiCommand = async (input: {
  prompt: string
  workspaceId: string
  workspaceContext: string
  authToken: string
  requestedTools?: string[]
}) => {
  if (!isAiApiConfigured) {
    throw new AiAssistantApiError('Set VITE_API_BASE_URL to connect CollabOS AI to the API server.')
  }

  const response = await fetch(`${configuredApiBaseUrl}/api/ai/command`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${input.authToken}`,
    },
    body: JSON.stringify({
      prompt: input.prompt,
      workspaceId: input.workspaceId,
      requestedTools: input.requestedTools || [],
      workspaceContext: input.workspaceContext,
    }),
  })

  if (!response.ok) {
    throw new AiAssistantApiError(await readErrorMessage(response), response.status)
  }

  return response.json() as Promise<AiCommandResponse>
}
