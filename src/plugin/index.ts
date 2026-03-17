import type { PluginObj } from "@babel/core";
import type { NodePath } from "@babel/core";
import * as t from "@babel/types";

function isConsoleLog(path: NodePath<t.CallExpression>): boolean {
  const callee = path.node.callee;
  return (
    t.isMemberExpression(callee) &&
    t.isIdentifier(callee.object, { name: "console" }) &&
    t.isIdentifier(callee.property, { name: "log" })
  );
}

const plugin: PluginObj = {
  name: "ast-explorer-local-plugin",
  visitor: {
    Identifier(path) {
      if (path.node.name === "x") {
        path.node.name = "transformedX";
      }
    },
    CallExpression(path) {
      if (!isConsoleLog(path)) {
        return;
      }

      path.node.arguments.unshift(t.stringLiteral("[plugin]"));
    },
  },
};

export default plugin;
