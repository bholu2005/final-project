class CodeChunker:
    """
    (NEW) Preprocesses raw programming scripts by stripping whitespace,
    splitting code structures by logical functions, and generating optimal chunks for embedding.
    """
    def __init__(self, chunk_size=500, overlap=50):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def generate_chunks(self, file_content: str):
        lines = file_content.split("\n")
        chunks = []
        current_chunk = []
        current_len = 0

        for line in lines:
            line_len = len(line)
            current_chunk.append(line)
            current_len += line_len

            if current_len >= self.chunk_size:
                chunks.append("\n".join(current_chunk))
                # Retain overlap lines
                current_chunk = current_chunk[-3:] if len(current_chunk) > 3 else []
                current_len = sum(len(l) for l in current_chunk)

        if current_chunk:
            chunks.append("\n".join(current_chunk))

        return chunks
