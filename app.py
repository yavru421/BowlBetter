'''
import gradio as gr
import os
from groq import Groq
from PIL import Image
import base64
import io
from loguru import logger
from dotenv import load_dotenv

load_dotenv()

logger.add("application.log", format="{time} {level} {message}", level="INFO")

# Removed initial client instantiation here

def get_groq_client(current_api_key_from_state): # Accepts API key from Gradio state
    # Prioritize the key from state (which might have been set by UI or initialized from env)
    api_key = current_api_key_from_state
    
    if not api_key:
        logger.error("GROQ_API_KEY not configured.")
        raise gr.Error("GROQ_API_KEY is not configured. Please set it in the Settings tab or as an environment variable.")
    # logger.info(f"Using API Key: {'*' * (len(api_key) - 4) + api_key[-4:] if api_key and len(api_key) > 4 else 'key_too_short_or_none'}")
    return Groq(api_key=api_key)

def safe_api_call(api_function, *args, **kwargs):
    """Wrapper for safe API calls with logging"""
    try:
        return api_function(*args, **kwargs)
    except Exception as e:
        logger.error(f"API call failed: {e}")
        gr.Warning(f"API Call Failed: {e}")
        return None

def ask_compound_beta(question, context="", model="llama3-8b-8192", current_api_key=None): # Added current_api_key
    logger.info(f"ask_compound_beta called with question: '{question}', context: '{context}', model: '{model}'. API key provided: {'Yes' if current_api_key else 'No'}")
    client = get_groq_client(current_api_key) # Pass current_api_key
    prompt = f"{context}\\n{question}" if context else question
    try:
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=model
        )
        response = chat_completion.choices[0].message.content
        logger.info(f"Groq API response: {response}")
        return response
    except Exception as e:
        logger.error(f"Error in ask_compound_beta: {e}")
        raise gr.Error(f"Failed to get response from Groq API: {e}")

def ask_compound_beta_vision(question, image_pil, model="llama3-8b-8192", current_api_key=None): # Added current_api_key and defaulting to a common model, adjust as needed
    logger.info(f"ask_compound_beta_vision called with question: '{question}', model: '{model}'. API key provided: {'Yes' if current_api_key else 'No'}")
    if image_pil is None:
        logger.warning("No image provided for vision question.")
        return "Please upload an image to ask a question about it."
    client = get_groq_client(current_api_key) # Pass current_api_key
    
    # Convert PIL Image to base64
    buffered = io.BytesIO()
    image_pil.save(buffered, format="JPEG") # Or PNG, depending on your needs
    base64_image = base64.b64encode(buffered.getvalue()).decode('utf-8')
    
    try:
        chat_completion = client.chat.completions.create(
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": question},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}},
                ],
            }],
            model=model # Ensure this model supports vision. Check Groq documentation for available vision models.
        )
        response = chat_completion.choices[0].message.content
        logger.info(f"Groq Vision API response: {response}")
        return response
    except Exception as e:
        logger.error(f"Error in ask_compound_beta_vision: {e}")
        raise gr.Error(f"Failed to get vision response from Groq API: {e}")

# --- Gradio Interface --- #

with gr.Blocks(theme=gr.themes.Soft()) as demo:
    # Gradio state to hold the API key. Initialized with environment variable if available.
    api_key_state = gr.State(os.environ.get('GROQ_API_KEY'))

    gr.Markdown("# BowlBetter: Compound-Beta Playground")
    gr.Markdown("Interact with Groq's models for text and vision tasks. Configure your `GROQ_API_KEY` in the Settings tab or set it as an environment variable.")

    with gr.Tabs():
        with gr.TabItem("Text Q&A"):
            gr.Markdown("## Ask Anything")
            text_question_input = gr.Textbox(label="Your Question", placeholder="What are the key features of the Compound-Beta model?")
            text_context_input = gr.Textbox(label="Optional Context", placeholder="Provide any relevant background information.")
            text_model_dropdown = gr.Dropdown(
                label="Select Model", 
                choices=["llama3-8b-8192", "mixtral-8x7b-32768", "gemma-7b-it", "llama3-70b-8192"], # Add more models as needed from Groq
                value="llama3-8b-8192"
            )
            text_submit_button = gr.Button("Ask Text Model")
            text_output = gr.Markdown()

        with gr.TabItem("Vision Q&A"):
            gr.Markdown("## Image Understanding")
            vision_image_input = gr.Image(type="pil", label="Upload Image")
            vision_question_input = gr.Textbox(label="Question about the image", placeholder="What is happening in this image?")
            vision_model_dropdown = gr.Dropdown(
                label="Select Vision Model", 
                # Update with actual vision-capable models from Groq.
                # Common vision models like LLaVA might be available. Check Groq's model list.
                choices=["llama3-8b-8192", "llava-1.5-7b-hf", "gemma-7b-it"], # Example: llama3 is not vision. Added llava as an example.
                value="llava-1.5-7b-hf" # Example, ensure this is a valid vision model on Groq
            )
            vision_submit_button = gr.Button("Ask Vision Model")
            vision_output = gr.Markdown()

        with gr.TabItem("Settings"):
            gr.Markdown("## API Key Configuration")
            gr.Markdown("Set your Groq API key here to use for the current session. This will override any environment variable.")
            api_key_input_settings = gr.Textbox(
                label="Groq API Key", 
                placeholder="Enter your Groq API key (e.g., gsk_...)", 
                type="password"
            )
            save_api_key_button = gr.Button("Set API Key for Session")
            api_key_status_output = gr.Markdown()

            def update_api_key_in_state(new_key_from_textbox):
                if new_key_from_textbox:
                    logger.info("API Key has been set via UI for this session.")
                    return new_key_from_textbox, "<p style='color:green;'>API Key set for this session.</p>"
                else:
                    # If cleared, revert to environment variable if it exists
                    env_key = os.environ.get('GROQ_API_KEY')
                    if env_key:
                        logger.info("API Key input cleared. Reverting to environment variable.")
                        return env_key, "<p style='color:blue;'>API Key input cleared. Using key from environment variable (if set).</p>"
                    else:
                        logger.info("API Key input cleared. No environment variable key found.")
                        return None, "<p style='color:orange;'>API Key input cleared. No API key is currently configured from environment either.</p>"

            save_api_key_button.click(
                fn=update_api_key_in_state,
                inputs=[api_key_input_settings],
                outputs=[api_key_state, api_key_status_output]
            )
            
            # Display initial status of the API key
            def get_initial_api_key_status(current_key_in_state):
                if current_key_in_state:
                    # Check if it came from env or was already set (less likely on first load unless state persists)
                    if current_key_in_state == os.environ.get('GROQ_API_KEY') and os.environ.get('GROQ_API_KEY'):
                         return "<p style='color:blue;'>Currently using API Key from environment variable.</p>"
                    return "<p style='color:green;'>API Key is configured for this session.</p>" # If state has a key not matching current env (e.g. set by user)
                return "<p style='color:red;'>API Key not configured. Please set it above or as an environment variable.</p>"
            
            # Use a hidden button to trigger the initial status load, or display directly if possible
            # For simplicity, let's just rely on the update message and errors for now.
            # A more complex setup could use gr.HTML with a JS call or a loaded event.
            # The gr.Warning below is removed as this tab provides more direct control.

    # Removed the general API key warning here, as settings tab handles it.

    # Event Handlers - Pass the api_key_state to the functions
    text_submit_button.click(
        fn=ask_compound_beta,
        inputs=[text_question_input, text_context_input, text_model_dropdown, api_key_state], # Pass state
        outputs=text_output
    )

    vision_submit_button.click(
        fn=ask_compound_beta_vision,
        inputs=[vision_question_input, vision_image_input, vision_model_dropdown, api_key_state], # Pass state
        outputs=vision_output
    )

if __name__ == "__main__":
    demo.launch()
