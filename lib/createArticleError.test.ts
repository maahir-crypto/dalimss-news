import assert from "node:assert/strict";
import {
  articleCreateFailureResponse,
  describeArticleCreateError,
  shortDatabaseError,
  validationErrorDetail,
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
  const message = [
    "Invalid `prisma.article.create()` invocation:",
    "",
    "{",
    "  data: {",
    '    title: "iPhone 18 Pro Reliance Digital price",',
    '    content: "<p>secret draft text that must not leak to the admin response</p>",',
    "    tags: [",
    '      "iPhone",',
    '      "Reliance Digital"',
    "    ],",
    "    ~~~~~~~~~~~~~~~~~~~~",
    "  }",
    "}",
    "",
    "Argument `tags`: Invalid value provided. Expected String or Null, provided (String, String).",
  ].join("\n");
  const body = articleCreateFailureResponse(
    { name: "PrismaClientValidationError", message },
    true
  );

  assert.equal(body.code, "VALIDATION");
  assert.equal(
    body.detail,
    "Argument `tags`: Invalid value provided. Expected String or Null, provided (String, String)."
  );
  assert.equal(body.detail.includes("secret draft"), false);
  assert.ok(body.detail.length <= 300);
  assert.equal(validationErrorDetail(message), body.detail);
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
