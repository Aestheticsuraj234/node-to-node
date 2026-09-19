import { step } from "inngest";
import { inngest } from "../client";
import { workflowTriggered } from "../events";
import { runWorkflow } from "@/modules/engine/lib/run-workflow";

export const executeWorkflow = inngest.createFunction({
    id:"execute-workflow",
    name:"Execute Workflow",
    triggers:[workflowTriggered],
},

async({event , step})=>{
    const { executionId, workflowId } = event.data;

    await step.run("run-workflow" , async()=>{
        await runWorkflow(executionId);
    });

    return {ok:true , workflowId , executionId}
})