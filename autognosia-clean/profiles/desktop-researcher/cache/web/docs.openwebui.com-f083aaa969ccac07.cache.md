**Open WebUI** [Blog](https://openwebui.com/blog)
On this page

...

# FAQ
## Q: How can I get support or ask for help? [​](https://docs.openwebui.com/faq/ "Direct link to Q: How can I get support or ask for help?")
documentation. Simply ping the bot with your question in the same message, wait a few seconds, and it will answer you. As our documentation improves, so does the bot.
3.

...

### Q: How can I manage or delete files I've uploaded? [​](https://docs.openwebui.com/faq/ "Direct link to Q: How can I manage or delete files I've uploaded?")
This dashboard allows you to search through all your uploaded documents, view their details, and delete them.

...

### Q: I get "The prompt is too long" / "context length exceeded" after a while in a chat. How do I fix it? [​](https://docs.openwebui.com/faq/ "Direct link to Q: I get "The prompt is too long" / "context length exceeded" after a while in a chat. How do I fix it?")
Context management is done with filter Functions : `inlet()` receives the full

...

For the full write-up with examples, see Context Window / Prompt Too Long .

...

### Q: Can I use Open WebUI offline, in air-gapped networks, or in extreme environments like outer space? [​](https://docs.openwebui.com/faq/ "Direct link to Q: Can I use Open WebUI offline, in air-gapped networks, or in extreme environments like outer space?")
tools, and data local and predictable even under extreme latency or complete

...

### Q: Why isn't my Open WebUI updating? I've re-pulled/restarted the container, and nothing changed. [​](https://docs.openwebui.com/faq/ "Direct link to Q: Why isn't my Open WebUI updating? I've re-pulled/restarted the container, and nothing changed.")
the existing container, and finally start a new one.

...

3. **Start the new container with your data attached:**

...

our full **Updating Guide** .

...

### Q: Why doesn't Speech-to-Text (STT) and Text-to-Speech (TTS) work in my deployment? ​ and Text-to-Speech (TTS) work in my deployment?")
Ensuring your deployment is accessible over HTTPS can resolve these issues, enabling full functionality of STT/TTS features.

...

### Q: Why doesn't Open WebUI include built-in HTTPS support? [​](https://docs.openwebui.com/faq/ "Direct link to Q: Why doesn't Open WebUI include built-in HTTPS support?")
Though we don't offer official documentation on setting up HTTPS, community members may provide guidance upon request, sharing insights and suggestions based on their

...

### Q: Why can't Open WebUI start with an SSL error? [​](https://docs.openwebui.com/faq/ "Direct link to Q: Why can't Open WebUI start with an SSL error?")
**A:** The SSL error you're encountering when starting Open WebUI is likely due to the absence of SSL certificates or incorrect configuration of [huggingface.co](https://huggingface.co/) .
To resolve this issue, you could set up a mirror for HuggingFace, such as [hf-mirror.com](https://hf-mirror.com/) , and specify it as the endpoint when starting the Docker container.
Use the `-e HF_ENDPOINT=https://hf-mirror.com/` parameter to define the HuggingFace mirror address in the Docker run command. For example, you can modify the Docker run command as follows:

...

```
  always  ghcr.io/open-webui/open-webui:main
```

...

### Q: I'm getting "The content provided is empty" when uploading files via the API. Why? [​](https://docs.openwebui.com/faq/ "Direct link to Q: I'm getting "The content provided is empty" when uploading files via the API. Why?")
**A:** This is a **race condition** , not an actual empty file.
When you upload a file through the API, the endpoint returns immediately with a file ID, but content extraction
and embedding computation happen **asynchronously in the background** .
If you immediately try to add the file to a knowledge base before processing completes, the system sees empty

...

**Solution:** Poll the file status endpoint until processing is complete:
```
import  requests import  time def  wait_for_processing (token, file_id):     url  =  f 'http://localhost:30
00/api/v1/files/ { file_id } /process/status'     headers  =  { 'Authorization' :  f 'Bearer  { token } ' }
     while  True :         status  =  requests.get(url,  headers = headers).json().get( 'status' )         
if  status  ==  'completed' :             return  True         elif  status  ==  'failed' :             rai
```

...

For complete workflow examples, see the **API Endpoints documentation** and the **RAG Troubleshooting guide** .

...

### Q: Why doesn't Open WebUI natively support [Provider X]'s proprietary API? [​](https://docs.openwebui.com/faq/ "Direct link to Q: Why doesn't Open WebUI natively support [Provider X]'s proprietary API?")
**A:** Open WebUI is highly modular with a plugin system including tools, functions, and most notably **pipes** .

...

[community-built](https://openwebui.com/) and usually well-maintained ones already available.
That said, Open WebUI's core is built around **universal protocols** , not specific providers.
Our stance is to support standard, widely-adopted APIs like the **OpenAI Chat Completions protocol** .
This protocol-centric design ensures that Open WebUI remains backend-agnostic and compatible with dozens of providers simultaneously.

...

truly open ecosystem.

...

#### 1. The Cascading Demand Problem ​
Supporting one proprietary API sets a precedent. Once that precedent exists, every other major provider becomes a reasonable request. What starts as "just one provider" quickly becomes many integrations, each with their own quirks, authentication schemes, and breaking changes.

...

#### 2. Maintenance is the Real Burden ​
* Each provider updates their API independently. When a provider changes something, we must update and test immediately
* Changes in one integration can break compatibility with others
* Every integration requires ongoing testing across multiple scenarios

...

#### 3. Technical Complexity ​
Each provider has different approaches to:
* Reasoning/thinking content format and structure
* Tool calling schemas and response formats
* Authentication and request signing
* Error handling and rate limiting

...

#### 5. Pipes are the Modular Solution ​
The pipes architecture exists precisely to solve this problem. One-click install a community pipe and you get full provider API support. This is exactly the modularity that allows:
* Community members to maintain provider-specific integrations
* Users to choose only what they need
* The core project to remain stable and maintainable
The Recommended Path
For providers that don't follow widely adopted API standards, use:
* **[Open WebUI community](https://openwebui.com/)** : Community-maintained provider integrations (one-click install)
* **Middleware proxies** : Tools like LiteLLM or OpenRouter can translate proprietary APIs to widely adopted API formats

...

### Q: Why is the frontend integrated into the same Docker image? Isn't this unscalable or problematic? [​](https://docs.openwebui.com/faq/ "Direct link to Q: Why is the frontend integrated into the same Docker image? Isn't this unscalable or problematic?")
misunderstanding of how modern Single-Page Applications work.

...

### Q: Is Open WebUI scalable for large organizations or enterprise deployments? [​](https://docs.openwebui.com/faq/ "Direct link to Q: Is Open WebUI scalable for large organizations or enterprise deployments?")
Through horizontal scaling, flexible storage backends, externalized authentication and database support, and full container

...

### Q: How often is Open WebUI updated? (Release Schedule) [​](https://docs.openwebui.com/faq/ "Direct link to Q: How often is Open WebUI updated? (Release Schedule)")
To stay informed, you can follow release notes and announcements on our [GitHub Releases page](https://github.com/open-webui/open-webui/releases) .

...

### Need Further Assistance? [​](https://docs.openwebui.com/faq/ "Direct link to Need Further Assistance?")
This content is for informational purposes only and does not constitute a warranty, guarantee, or contractual commitment. Open WebUI is provided "as is." See your license for applicable terms.

...

* Q: I'm getting "The content provided is empty" when uploading files via the API. Why?
* Q: I asked the model what it is and it gave the wrong answer. Is Open WebUI routing to the wrong model?