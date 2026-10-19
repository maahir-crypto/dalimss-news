import assert from "node:assert/strict";
import {
  articleCreateFailureResponse,
  describeArticleCreateError,
  shortDatabaseError,
} from "./createArticleError";

{
  const body = articleCreateFailureResponse(
    {
      name: "PrismaClientKnownRequestError",
      code: "P2002",
      message:
        "Invalid `prisma.article.create()` invocation:\n\n\nUnique constraint failed on the fields: (`id`)",
      meta: { modelName: "Article", target: ["id"] },
    },
    true
  );

  assert.deepEqual(body, {
    error: "Create failed",
    code: "P2002",
    detail: "Unique constraint failed on the fields: (`id`)",
  });
}

{
  const described = describeArticleCreateError({
    name: "PrismaClientKnownRequestError",
    code: "P2003",
    message:
      "Foreign key constraint violated on the constraint: `Article_authorId_fkey`",
    meta: { field_name: "authorId" },
  });

  assert.equal(described.code, "P2003");
  assert.match(described.detail, /Article_authorId_fkey/);
}

{
  const body = articleCreateFailureResponse(
    {
      name: "PrismaClientValidationError",
      message: "Invalid invocation. Argument tags. Article body: secret draft text",
    },
    true
  );

  assert.equal(body.code, "VALIDATION");
  assert.equal(body.detail, "The article payload was rejected before it was saved.");
  assert.equal(JSON.stringify(body).includes("secret draft"), false);
}

{
  const described = describeArticleCreateError({
    name: "PrismaClientInitializationError",
    errorCode: "P1001",
    message:
      "Can't reach database server at `postgresql://user:secret-pass@ep-example.neon.tech:5432/db`",
  });

  assert.equal(described.code, "P1001");
  assert.equal(described.detail.includes("secret-pass"), false);
  assert.match(described.detail, /redacted-url|Can't reach database server/);
}

{
  const err = {
    name: "PrismaClientKnownRequestError",
    code: "P2002",
    message: "Unique constraint failed on the fields: (`slug`)",
  };

  assert.deepEqual(articleCreateFailureResponse(err, false), {
    error: "Create failed",
  });
}

{
  const described = describeArticleCreateError(
    new Error(
      "ERROR: cannot execute INSERT in a read-only transaction\npassword=super-secret"
    )
  );

  assert.equal(described.code, undefined);
  assert.match(described.detail, /read-only/);
  assert.equal(described.detail.includes("super-secret"), false);
}

{
  assert.equal(
    shortDatabaseError(
      "Invalid `prisma.article.create()` invocation:\n\nThe column `reportingBasis` does not exist in the current database."
    ),
    "The column `reportingBasis` does not exist in the current database."
  );
}

console.log("createArticleError checks passed");
