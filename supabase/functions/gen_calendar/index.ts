// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.


import {axiod as axios} from "https://deno.land/x/axiod@0.26.2/mod.ts";
import AxiosError from "https://deno.land/x/axiod@0.26.2/mod.ts";

console.log("Hello from Functions!")

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const endpoint = "api-endpoint";
const apiKey = "api-key";

// Required Azure OpenAI deployment name and API version
// const apiVersion = "2025-01-01-preview";
// const deploymentName = "gpt-4o"; //This must match your deployment name.


async function getAPIResponse(dataUrl: string) {

  try {
    const res = await axios.post(endpoint, 
      {"messages":[{"role":"system","content":[{"type":"text","text":`You convert images into ICS files. The current date is ${new Date().toDateString()}`}]},{"role":"user","content":[{"type":"text","text":"Create an ICS file from the following image"},{"type":"image_url","image_url":{"url":dataUrl}},{"type":"text","text":"\n"}]}],"temperature":0.7,"top_p":0.95,"frequency_penalty":0,"presence_penalty":0,"max_tokens":800,"stop":null,"stream":false}
      , {
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      }
    });

    console.log("dataqqq:")
    console.log(JSON.stringify(res.data, null));

    return res.data;

  } catch (error) {
    if(error instanceof AxiosError) {
      console.log("error")
      // console.log(error.response?.data);
    }
    throw error;
  }
}

Deno.serve(async (req) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // const reqData = getAPIResponse().choices[0].message
    const reqData = await req.json()
    if(!reqData || !reqData.image) {
      return new Response(
        JSON.stringify({ error: "Invalid request data" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      )
    }



    const data = {
      status: "success",
      calendar: reqData,
    }

    const resData = await getAPIResponse(reqData.image)
    console.log(`resData:`, resData)

    if(resData.choices && resData.choices[0] && resData.choices[0].message) {
      // get the part from BEGIN:VCALENDAR to END:VCALENDAR
      const calendar = resData.choices[0].message.content.split("BEGIN:VCALENDAR")[1].split("END:VCALENDAR")[0]
      data.calendar = `BEGIN:VCALENDAR\n${calendar}\nEND:VCALENDAR`
    }

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, },
    )
  } catch (error) {
    console.error("Error:", error)
    throw error
    return new Response(
      JSON.stringify({ error: JSON.stringify(error) }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/gen_calendar' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/