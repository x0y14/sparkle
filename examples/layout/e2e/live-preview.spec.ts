import { test, expect } from "@playwright/test"

test.describe("Layout Live Preview integration", () => {
  test("page loads with editor and preview", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("layout-live-preview")).toBeVisible()
    await expect(page.locator("layout-editor")).toBeVisible()
    await expect(page.locator("layout-preview")).toBeVisible()
  })

  test("shows placeholder when editor is empty", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("layout-preview")).toContainText("Preview will appear here")
  })

  test("renders item in real-time on valid JSON input", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("layout-editor textarea")
    await textarea.fill('{"type":"item","id":"hello"}')
    await expect(page.locator("layout-preview [data-node-id='hello']")).toBeVisible()
  })

  test("renders nested layout with horizontal direction", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("layout-editor textarea")
    const json = JSON.stringify({
      type: "layout",
      direction: "horizontal",
      children: [
        { type: "item", id: "a" },
        { type: "item", id: "b" },
      ],
    })
    await textarea.fill(json)
    await expect(page.locator("layout-preview [data-node-type='layout']")).toBeVisible()
    await expect(page.locator("layout-preview [data-node-id='a']")).toBeVisible()
    await expect(page.locator("layout-preview [data-node-id='b']")).toBeVisible()
  })

  test("horizontal layout items are displayed side by side", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("layout-editor textarea")
    const json = JSON.stringify({
      type: "layout",
      direction: "horizontal",
      children: [
        { type: "item", id: "left" },
        { type: "item", id: "right" },
      ],
    })
    await textarea.fill(json)
    const left = page.locator("layout-preview [data-node-id='left']")
    const right = page.locator("layout-preview [data-node-id='right']")
    await expect(left).toBeVisible()
    await expect(right).toBeVisible()
    const leftBox = await left.boundingBox()
    const rightBox = await right.boundingBox()
    expect(leftBox).not.toBeNull()
    expect(rightBox).not.toBeNull()
    // leftの右端がrightの左端以下 = 横並び
    expect(leftBox!.x + leftBox!.width).toBeLessThanOrEqual(rightBox!.x + 1)
    // 同じY座標 = 同じ行
    expect(Math.abs(leftBox!.y - rightBox!.y)).toBeLessThan(5)
  })

  test("horizontal layout items share space equally", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("layout-editor textarea")
    const json = JSON.stringify({
      type: "layout",
      direction: "horizontal",
      children: [
        { type: "item", id: "left" },
        { type: "item", id: "right" },
      ],
    })
    await textarea.fill(json)
    const left = page.locator("layout-preview [data-node-id='left']")
    const right = page.locator("layout-preview [data-node-id='right']")
    await expect(left).toBeVisible()
    await expect(right).toBeVisible()
    const leftBox = await left.boundingBox()
    const rightBox = await right.boundingBox()
    expect(leftBox).not.toBeNull()
    expect(rightBox).not.toBeNull()
    expect(Math.abs(leftBox!.width - rightBox!.width)).toBeLessThan(5)
  })

  test("shows error state for invalid JSON", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("layout-editor textarea")
    await textarea.fill("{not valid json")
    await expect(page.locator("layout-preview [data-error]")).toBeVisible()
  })

  test("updates preview when JSON changes", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("layout-editor textarea")
    await textarea.fill('{"type":"item","id":"first"}')
    await expect(page.locator("layout-preview [data-node-id='first']")).toBeVisible()
    await textarea.fill('{"type":"item","id":"second"}')
    await expect(page.locator("layout-preview [data-node-id='second']")).toBeVisible()
  })

  test("screenshot: empty state", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("layout-live-preview")).toBeVisible()
    await expect(page).toHaveScreenshot("empty-state.png")
  })

  test("screenshot: single item", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("layout-editor textarea")
    await textarea.fill('{"type":"item","id":"hello"}')
    await expect(page.locator("layout-preview [data-node-id='hello']")).toBeVisible()
    await expect(page).toHaveScreenshot("single-item.png")
  })

  test("screenshot: nested layout", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("layout-editor textarea")
    const json = JSON.stringify(
      {
        type: "layout",
        direction: "vertical",
        children: [
          { type: "item", id: "header" },
          {
            type: "layout",
            direction: "horizontal",
            children: [
              { type: "item", id: "sidebar" },
              { type: "item", id: "main" },
            ],
          },
          { type: "item", id: "footer" },
        ],
      },
      null,
      2,
    )
    await textarea.fill(json)
    await expect(page.locator("layout-preview [data-node-id='header']")).toBeVisible()
    await expect(page).toHaveScreenshot("nested-layout.png")
  })

  test("screenshot: error state", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("layout-editor textarea")
    await textarea.fill("{invalid json here")
    await expect(page.locator("layout-preview [data-error]")).toBeVisible()
    await expect(page).toHaveScreenshot("error-state.png")
  })

  test("drag item to another layout updates JSON", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("layout-editor textarea")
    const json = JSON.stringify({
      type: "layout", direction: "vertical",
      children: [
        { type: "item", id: "a" },
        { type: "layout", direction: "horizontal", children: [
          { type: "item", id: "b" },
          { type: "item", id: "c" },
        ]},
      ],
    })
    await textarea.fill(json)
    await expect(page.locator("layout-preview [data-node-id='a']")).toBeVisible()

    const itemA = page.locator("layout-preview [data-node-id='a']")
    const targetLayout = page.locator("layout-preview [data-node-type='layout'][data-path='1']")
    await itemA.dragTo(targetLayout)

    const updatedJson = await textarea.inputValue()
    const parsed = JSON.parse(updatedJson)
    expect(parsed.children.length).toBe(1)
    expect(parsed.children[0].children.some((c: any) => c.id === "a")).toBe(true)
  })

  test("dragged item appears in target layout", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("layout-editor textarea")
    const json = JSON.stringify({
      type: "layout", direction: "vertical",
      children: [
        { type: "item", id: "x" },
        { type: "layout", direction: "horizontal", children: [
          { type: "item", id: "y" },
        ]},
      ],
    })
    await textarea.fill(json)
    await expect(page.locator("layout-preview [data-node-id='x']")).toBeVisible()

    const itemX = page.locator("layout-preview [data-node-id='x']")
    const targetLayout = page.locator("layout-preview [data-node-type='layout'][data-path='1']")
    await itemX.dragTo(targetLayout)

    await expect(page.locator("layout-preview [data-node-type='layout'][data-direction='horizontal'] [data-node-id='x']")).toBeVisible()
  })

  test("screenshot: after drag and drop", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("layout-editor textarea")
    const json = JSON.stringify({
      type: "layout", direction: "vertical",
      children: [
        { type: "item", id: "drag-me" },
        { type: "layout", direction: "horizontal", children: [
          { type: "item", id: "target-sibling" },
        ]},
      ],
    })
    await textarea.fill(json)
    await expect(page.locator("layout-preview [data-node-id='drag-me']")).toBeVisible()

    const item = page.locator("layout-preview [data-node-id='drag-me']")
    const target = page.locator("layout-preview [data-node-type='layout'][data-path='1']")
    await item.dragTo(target)

    await expect(page.locator("layout-preview [data-node-type='layout'][data-direction='horizontal'] [data-node-id='drag-me']")).toBeVisible()
    await expect(page).toHaveScreenshot("after-drag-drop.png")
  })

  test("toolbox is visible", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("layout-toolbox")).toBeVisible()
    await expect(page.locator("layout-toolbox [data-toolbox-type='item']")).toBeVisible()
    await expect(page.locator("layout-toolbox [data-toolbox-type='vertical']")).toBeVisible()
    await expect(page.locator("layout-toolbox [data-toolbox-type='horizontal']")).toBeVisible()
  })

  test("drag item from toolbox to preview adds item", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("layout-editor textarea")
    const json = JSON.stringify({
      type: "layout", direction: "vertical",
      children: [{ type: "item", id: "existing" }],
    })
    await textarea.fill(json)
    await expect(page.locator("layout-preview [data-node-id='existing']")).toBeVisible()

    const toolboxItem = page.locator("layout-toolbox [data-toolbox-type='item']")
    const targetLayout = page.locator("layout-preview [data-node-type='layout'][data-path='']")
    const srcBox = await toolboxItem.boundingBox()
    const dstBox = await targetLayout.boundingBox()
    await page.mouse.move(srcBox!.x + srcBox!.width / 2, srcBox!.y + srcBox!.height / 2)
    await page.mouse.down()
    await page.mouse.move(dstBox!.x + dstBox!.width / 2, dstBox!.y + dstBox!.height / 2, { steps: 5 })
    await page.mouse.up()

    const updatedJson = await textarea.inputValue()
    const parsed = JSON.parse(updatedJson)
    expect(parsed.children.length).toBe(2)
    expect(parsed.children.some((c: any) => c.type === "item" && c.id.startsWith("item-"))).toBe(true)
  })

  test("drag vertical layout from toolbox adds empty layout", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("layout-editor textarea")
    const json = JSON.stringify({
      type: "layout", direction: "vertical",
      children: [{ type: "item", id: "existing" }],
    })
    await textarea.fill(json)
    await expect(page.locator("layout-preview [data-node-id='existing']")).toBeVisible()

    const toolboxVertical = page.locator("layout-toolbox [data-toolbox-type='vertical']")
    const targetLayout = page.locator("layout-preview [data-node-type='layout'][data-path='']")
    const srcBox = await toolboxVertical.boundingBox()
    const dstBox = await targetLayout.boundingBox()
    await page.mouse.move(srcBox!.x + srcBox!.width / 2, srcBox!.y + srcBox!.height / 2)
    await page.mouse.down()
    await page.mouse.move(dstBox!.x + dstBox!.width / 2, dstBox!.y + dstBox!.height / 2, { steps: 5 })
    await page.mouse.up()

    const updatedJson = await textarea.inputValue()
    const parsed = JSON.parse(updatedJson)
    expect(parsed.children.length).toBe(2)
    expect(parsed.children.some((c: any) => c.type === "layout" && c.direction === "vertical")).toBe(true)
  })

  test("screenshot: with toolbox", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("layout-editor textarea")
    const json = JSON.stringify({
      type: "layout", direction: "vertical",
      children: [
        { type: "item", id: "header" },
        { type: "layout", direction: "horizontal", children: [
          { type: "item", id: "sidebar" },
          { type: "item", id: "main" },
        ]},
      ],
    }, null, 2)
    await textarea.fill(json)
    await expect(page.locator("layout-preview [data-node-id='header']")).toBeVisible()
    await expect(page).toHaveScreenshot("with-toolbox.png")
  })

  test("drag item from toolbox to empty preview creates root node", async ({ page }) => {
    await page.goto("/")
    const toolboxItem = page.locator("layout-toolbox [data-toolbox-type='item']")
    const previewArea = page.locator("layout-preview")
    const srcBox = await toolboxItem.boundingBox()
    const dstBox = await previewArea.boundingBox()
    await page.mouse.move(srcBox!.x + srcBox!.width / 2, srcBox!.y + srcBox!.height / 2)
    await page.mouse.down()
    await page.mouse.move(dstBox!.x + dstBox!.width / 2, dstBox!.y + dstBox!.height / 2, { steps: 5 })
    await page.mouse.up()

    const textarea = page.locator("layout-editor textarea")
    const updatedJson = await textarea.inputValue()
    const parsed = JSON.parse(updatedJson)
    expect(parsed.type).toBe("item")
    expect(parsed.id).toMatch(/^item-/)
  })

  test("drag vertical layout from toolbox to empty preview creates root layout", async ({ page }) => {
    await page.goto("/")
    const toolboxVertical = page.locator("layout-toolbox [data-toolbox-type='vertical']")
    const previewArea = page.locator("layout-preview")
    const srcBox = await toolboxVertical.boundingBox()
    const dstBox = await previewArea.boundingBox()
    await page.mouse.move(srcBox!.x + srcBox!.width / 2, srcBox!.y + srcBox!.height / 2)
    await page.mouse.down()
    await page.mouse.move(dstBox!.x + dstBox!.width / 2, dstBox!.y + dstBox!.height / 2, { steps: 5 })
    await page.mouse.up()

    const textarea = page.locator("layout-editor textarea")
    const updatedJson = await textarea.inputValue()
    const parsed = JSON.parse(updatedJson)
    expect(parsed.type).toBe("layout")
    expect(parsed.direction).toBe("vertical")
    expect(parsed.children).toEqual([])
  })

  test("clicking item shows inspector with id", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("layout-editor textarea")
    await textarea.fill(JSON.stringify({
      type: "layout", direction: "vertical",
      children: [{ type: "item", id: "test-id" }],
    }))
    await expect(page.locator("layout-preview [data-node-id='test-id']")).toBeVisible()
    await page.locator("layout-preview [data-node-id='test-id']").click()
    await expect(page.locator("layout-node-inspector [data-field='type']")).toContainText("item")
    const input = page.locator("layout-node-inspector [data-field='id'] input")
    await expect(input).toHaveValue("test-id")
  })

  test("clicking layout shows inspector with direction", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("layout-editor textarea")
    await textarea.fill(JSON.stringify({
      type: "layout", direction: "horizontal",
      children: [{ type: "item", id: "a" }],
    }))
    const layout = page.locator("layout-preview [data-node-type='layout']")
    await expect(layout).toBeVisible()
    // layoutのpadding領域（子要素の外側）をクリック
    const box = await layout.boundingBox()
    await page.mouse.click(box!.x + 4, box!.y + 4)
    await expect(page.locator("layout-node-inspector [data-field='type']")).toContainText("layout")
    const input = page.locator("layout-node-inspector [data-field='direction'] input")
    await expect(input).toHaveValue("horizontal")
  })

  test("changing id in inspector updates JSON", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("layout-editor textarea")
    await textarea.fill(JSON.stringify({
      type: "layout", direction: "vertical",
      children: [{ type: "item", id: "old-id" }],
    }))
    await expect(page.locator("layout-preview [data-node-id='old-id']")).toBeVisible()
    await page.locator("layout-preview [data-node-id='old-id']").click()
    const input = page.locator("layout-node-inspector [data-field='id'] input")
    await input.fill("new-id")
    await input.dispatchEvent("change")
    const updatedJson = await textarea.inputValue()
    expect(updatedJson).toContain("new-id")
    expect(updatedJson).not.toContain("old-id")
  })

  test("changing direction in inspector updates JSON", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("layout-editor textarea")
    await textarea.fill(JSON.stringify({
      type: "layout", direction: "horizontal",
      children: [{ type: "item", id: "a" }],
    }))
    const layout = page.locator("layout-preview [data-node-type='layout']")
    await expect(layout).toBeVisible()
    const box = await layout.boundingBox()
    await page.mouse.click(box!.x + 4, box!.y + 4)
    const input = page.locator("layout-node-inspector [data-field='direction'] input")
    await input.fill("vertical")
    await input.dispatchEvent("change")
    const updatedJson = await textarea.inputValue()
    expect(updatedJson).toContain("vertical")
  })

  test("screenshot: with inspector", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("layout-editor textarea")
    await textarea.fill(JSON.stringify({
      type: "layout", direction: "vertical",
      children: [
        { type: "item", id: "selected-item" },
        { type: "item", id: "other" },
      ],
    }, null, 2))
    await expect(page.locator("layout-preview [data-node-id='selected-item']")).toBeVisible()
    await page.locator("layout-preview [data-node-id='selected-item']").click()
    await expect(page).toHaveScreenshot("with-inspector.png")
  })

  test("delete button removes selected item", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("layout-editor textarea")
    await textarea.fill(JSON.stringify({
      type: "layout", direction: "vertical",
      children: [
        { type: "item", id: "keep" },
        { type: "item", id: "remove-me" },
      ],
    }))
    await expect(page.locator("layout-preview [data-node-id='remove-me']")).toBeVisible()
    await page.locator("layout-preview [data-node-id='remove-me']").click()
    await page.locator("layout-node-inspector [data-action='delete']").click()
    const updatedJson = await textarea.inputValue()
    expect(updatedJson).not.toContain("remove-me")
    expect(updatedJson).toContain("keep")
  })

  test("delete button removes layout with children", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("layout-editor textarea")
    await textarea.fill(JSON.stringify({
      type: "layout", direction: "vertical",
      children: [
        { type: "item", id: "top" },
        { type: "layout", direction: "horizontal", children: [
          { type: "item", id: "inner" },
        ]},
      ],
    }))
    const layout = page.locator("layout-preview [data-node-type='layout'][data-path='1']")
    await expect(layout).toBeVisible()
    const box = await layout.boundingBox()
    await page.mouse.click(box!.x + 4, box!.y + 4)
    await page.locator("layout-node-inspector [data-action='delete']").click()
    const updatedJson = await textarea.inputValue()
    expect(updatedJson).not.toContain("inner")
    expect(updatedJson).toContain("top")
    const parsed = JSON.parse(updatedJson)
    expect(parsed.children).toHaveLength(1)
  })

  test("delete root node clears preview and editor", async ({ page }) => {
    await page.goto("/")
    const textarea = page.locator("layout-editor textarea")
    await textarea.fill('{"type":"item","id":"root-item"}')
    await expect(page.locator("layout-preview [data-node-id='root-item']")).toBeVisible()
    await page.locator("layout-preview [data-node-id='root-item']").click()
    await page.locator("layout-node-inspector [data-action='delete']").click()
    const updatedJson = await textarea.inputValue()
    expect(updatedJson).toBe("")
    await expect(page.locator("layout-preview")).toContainText("Preview will appear here")
  })
})
