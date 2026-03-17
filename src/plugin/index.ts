import type { PluginObj } from '@babel/core'
import type { NodePath } from '@babel/core'
import * as t from '@babel/types'

type IdentifierMeta = {
  pure: boolean
  reason?: string
}

function isPureByComment(path: NodePath<t.Identifier>): boolean {
  return !!path.node.leadingComments?.some(comment => comment.value.trim() === 'pure')
}

const plugin = (): PluginObj => {
  const identifierMeta = new WeakMap<t.Identifier, IdentifierMeta>()

  return {
    name: 'ast-explorer-local-plugin',
    visitor: {
      Identifier(path) {
        const pure = path.isPure() || isPureByComment(path)
        const originalName = path.node.name

        path.node.name = pure ? 'pure' : 'impure'
        identifierMeta.set(path.node, {
          pure,
          reason: `renamed-from-${originalName}`,
        })
      },
      ArrowFunctionExpression(path) {
        path.node.params.forEach(param => {
          if (t.isIdentifier(param)) {
            identifierMeta.set(param, {
              pure: true,
              reason: 'parameter-of-arrow-function',
            })
          }
        })

        path.traverse({
          MemberExpression(innerPath) {
            if (!t.isIdentifier(innerPath.node.object)) {
              return
            }

            const meta = identifierMeta.get(innerPath.node.object)
            if (meta?.pure) {
              // Mark the member expression as pure if the object is pure
              identifierMeta.set(innerPath.node, {
                pure: true,
                reason: `member-of-${innerPath.node.object.name}`,
              })
            }
          },
        })
      },
    },
  }
}

export default plugin
