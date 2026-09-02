"""Verify Calendar and Tasks views render live API data after fixes."""
import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 900})
        
        console_warnings = []
        page = await context.new_page()
        page.on("console", lambda msg: console_warnings.append(msg.text) if msg.type == "warning" else None)
        
        await page.goto("http://localhost:8088", wait_until="networkidle", timeout=15000)
        await asyncio.sleep(2)
        
        # === Test Calendar View ===
        # Click the Calendar sidebar link
        cal_link = page.locator('.sidebar-link[data-view="calendar"]')
        await cal_link.click()
        await asyncio.sleep(2)
        
        # Check heading was set properly (new selector)
        heading = page.locator('#view-calendar .view-section-header .view-section-title')
        heading_text = await heading.inner_text()
        heading_set = heading_text.strip() != ""
        print(f"Calendar heading: '{heading_text}'")
        print(f"Calendar heading set: {heading_set}")
        
        # Check if calendar-stage (sidebar) or calendar-view-stage has event content
        cal_stage = page.locator('#calendar-stage')
        cal_stage_text = await cal_stage.inner_text()
        cal_stage_has_content = cal_stage_text.strip() != ""
        print(f"Calendar sidebar stage has content: {cal_stage_has_content}")
        if not cal_stage_has_content:
            print(f"  Sidebar stage content preview: '{cal_stage_text[:100]}'")
        
        # Check calendar-view-stage
        cal_view_stage = page.locator('#calendar-view-stage')
        cal_view_text = await cal_view_stage.inner_text()
        cal_view_has_content = cal_view_text.strip() != ""
        print(f"Calendar view stage has content: {cal_view_has_content}")
        if not cal_view_has_content:
            print(f"  View stage content preview: '{cal_view_text[:100]}'")
        
        # Check for event card elements (the actual rendered events)
        event_cards = page.locator('.event-card')
        event_card_count = await event_cards.count()
        month_pills = page.locator('.month-event-pill')
        month_pill_count = await month_pills.count()
        print(f"Event card elements: {event_card_count}")
        print(f"Month pill elements: {month_pill_count}")
        
        # Calendar shows events if: heading is set + has event cards OR has month pills
        calendar_has_events = heading_set and (event_card_count > 0 or month_pill_count > 0)
        print(f"Calendar shows events: {calendar_has_events}")
        
        # === Test Tasks View ===
        tasks_link = page.locator('.sidebar-link[data-view="tasks"]')
        await tasks_link.click()
        await asyncio.sleep(2)
        
        tasks_content = await page.locator('#tasks-view-container').inner_text()
        tasks_shows_tasks = tasks_content.strip() != "" and "No tasks" not in tasks_content
        print(f"Tasks view text length: {len(tasks_content)}")
        print(f"Tasks shows tasks: {tasks_shows_tasks}")
        
        task_cards = page.locator('.task-card')
        task_card_count = await task_cards.count()
        print(f"Task card elements found: {task_card_count}")
        
        # === Check console warnings ===
        has_console_warnings = len(console_warnings) > 0
        print(f"Console warnings: {len(console_warnings)}")
        if console_warnings:
            for w in console_warnings[:3]:
                print(f"  WARN: {w[:100]}")
        
        print("\n=== RESULTS ===")
        print(f"Calendar shows events: {calendar_has_events}")
        print(f"Tasks shows tasks: {tasks_shows_tasks}")
        print(f"No console warnings: {not has_console_warnings}")
        
        await browser.close()
        
        if calendar_has_events and tasks_shows_tasks and not has_console_warnings:
            print("\nALL CHECKS PASSED")
            exit(0)
        else:
            print("\nSOME CHECKS FAILED")
            exit(1)

if __name__ == "__main__":
    asyncio.run(main())
