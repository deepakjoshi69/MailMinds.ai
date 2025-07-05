import { NextResponse } from "next/server";
import {
  getTemplateById,
  updateTemplateById,
  deleteTemplateById,
} from "../../../../lib/db";

// GET /api/templates/[id]
export async function GET(request, context) {
  const { params } = context;

  if (!params?.id) {
    return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
  }

  const template = await getTemplateById(params.id);
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  return NextResponse.json(template);
}

// PUT /api/templates/[id]
export async function PUT(request, context) {
  const { params } = context;

  if (!params?.id) {
    return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
  }

  try {
    const body = await request.json();
    const updated = await updateTemplateById(params.id, body);
    if (!updated) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

// DELETE /api/templates/[id]
export async function DELETE(request, context) {
  const { params } = context;

  if (!params?.id) {
    return NextResponse.json({ error: "Template ID is required" }, { status: 400 });
  }

  try {
    const deleted = await deleteTemplateById(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }
    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}
