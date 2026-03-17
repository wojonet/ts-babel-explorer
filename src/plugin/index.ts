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
        const pure = path.isPure()
        const originalName = path.node.name

        path.node.name =
          'pureMember' === path.node.name ? 'pureMember' : pure ? `${path.node.name}Pure` : `${path.node.name}Impure`
        identifierMeta.set(path.node, {
          pure,
          reason: `renamed-from-${originalName}`,
        })
      },
      FunctionDeclaration(path) {
        const s = 's'
      },
      BinaryExpression(path) {
        const s = 's'
      },
      ReturnStatement(path) {
        const s = 's'
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
            // get binding information to determine if it's pure
            const binding = innerPath.scope.getBinding(innerPath.node.object.name)
            if (binding && binding.constant) {
              identifierMeta.set(innerPath.node.object, {
                pure: true,
                reason: `constant-binding-${innerPath.node.object.name}`,
              })
              innerPath.traverse({
                Identifier(idPath) {
                  if (idPath.key === 'property') {
                    idPath.node.name = `pureMember`
                  }
                },
              })
            }

            // if (meta?.pure) {
            //   innerPath.node.object.name = 'pure-member'
            // }
          },
        })
      },
    },
  }
}

export default plugin
