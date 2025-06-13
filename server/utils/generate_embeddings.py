import os
import json
from typing import List
import logging
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

def load_ukcat_data() -> List[str]:
    """Load and process UKCAT data files"""
    try:
        # Load all JSON files
        data_files = [
            "data/vr_true_false.json",
            "data/vr_inference.json",
            "data/qr_questions.json"
        ]
        
        all_texts = []
        for file_path in data_files:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
                # Extract relevant text from each file
                if "passages" in data:
                    for passage in data["passages"]:
                        all_texts.append(passage["passage_text"])
                        for question in passage.get("questions", []):
                            all_texts.append(f"Question: {question['question_text']}\nAnswer: {question['correct_answer']}\nExplanation: {question['explanation']}")
                
                if "questions" in data:
                    for question in data["questions"]:
                        all_texts.append(f"Question: {question['question_text']}\nAnswer: {question['correct_answer']}\nExplanation: {question['explanations']['detailed']}")
        
        return all_texts
        
    except Exception as e:
        logger.error(f"Error loading UKCAT data: {str(e)}")
        raise

def generate_and_save_embeddings():
    """Generate embeddings for UKCAT data and save them"""
    try:
        # Load data
        logger.info("Loading UKCAT data...")
        texts = load_ukcat_data()
        
        # Split texts into chunks
        logger.info("Splitting texts into chunks...")
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        
        chunks = text_splitter.split_text("\n\n".join(texts))
        
        # Initialize embeddings
        logger.info("Initializing embeddings...")
        embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
        
        # Create vector store
        logger.info("Creating vector store...")
        vector_store = FAISS.from_texts(chunks, embeddings)
        
        # Save vector store
        logger.info("Saving vector store...")
        vector_store.save_local("data/ukcat_embeddings")
        
        logger.info("Successfully generated and saved embeddings")
        
    except Exception as e:
        logger.error(f"Error generating embeddings: {str(e)}")
        raise

if __name__ == "__main__":
    generate_and_save_embeddings() 