from fastapi import FastAPI, Request
from pydantic import BaseModel
from transformers import RobertaTokenizer, RobertaModel
import torch
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = FastAPI()

tokenizer = RobertaTokenizer.from_pretrained("microsoft/codebert-base")
model = RobertaModel.from_pretrained("microsoft/codebert-base")

class SimilarityRequest(BaseModel):
    code: str
    previous_codes: list[str]

def get_code_embedding(code: str):
    tokens = tokenizer(code, return_tensors='pt', truncation=True, max_length=512)
    with torch.no_grad():
        outputs = model(**tokens)
    return outputs.last_hidden_state[:, 0, :].numpy()

@app.post("/check_similarity")
async def check_similarity(req: SimilarityRequest):
    code_emb = get_code_embedding(req.code)
    if req.previous_codes:
        prev_embs = np.vstack([get_code_embedding(c) for c in req.previous_codes])
        similarities = cosine_similarity(code_emb, prev_embs)[0]
        max_sim = float(np.max(similarities))
    else:
        similarities = []
        max_sim = 0.0
    return {
        "max_similarity": max_sim,
        "all_similarities": similarities.tolist()
    }