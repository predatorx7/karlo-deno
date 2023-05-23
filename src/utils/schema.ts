import { gql } from "graphql_tag";
import { DocumentNode } from "graphql_tag/deps";

export const getSchemas = async (paths: string[]): Promise<DocumentNode> => {
  const schemas: string[] = [];
  const promises = paths.map((e) =>
    Deno.readTextFile(e).then((e) => {
      if (typeof e !== "string") return;
      schemas.push(e);
    })
  );
  await Promise.all(promises);
  const schemaText = schemas.join("\n\n");
  return gql(schemaText);
};
