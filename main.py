import os
from movie_system import MovieSystem

def main():
    api_key = os.getenv('OPENAI_API_KEY', '').strip()
    if api_key:
        print(f"OpenAI API key detected (length: {len(api_key)}). Using LLM features.")
        # Test API key validity
        try:
            from openai import OpenAI
            test_client = OpenAI(api_key=api_key)
            test_client.models.list()  # Quick validation call
            print("API key validated successfully.")
        except Exception as e:
            if "401" in str(e) or "incorrect" in str(e).lower():
                print("Warning: API key appears invalid. Please check your OpenAI API key.")
                print("Get a valid key at: https://platform.openai.com/api-keys")
            else:
                print(f"API key validation: {str(e)[:100]}")
    else:
        print("Warning: OPENAI_API_KEY not set. Using mock mode.")
        print("To set: PowerShell: $env:OPENAI_API_KEY='your_key' | CMD: set OPENAI_API_KEY=your_key")
    system = MovieSystem(api_key if api_key else None)
    
    # Enrich movies
    print("Enriching movies...")
    count = system.enrich_movies(100)
    print(f"Enriched {count} movies")
    
    # Examples
    print("\n=== Recommendations ===")
    recs = system.recommend("action movies with high revenue and positive sentiment", 5)
    for m in recs:
        print(f"- {m['title']} (${m.get('revenue', 0):,})")
    
    print("\n=== Rating Prediction ===")
    rating = system.predict_rating(1, "prefers action and sci-fi")
    print(f"Predicted rating: {rating:.1f}/10")
    
    print("\n=== Natural Language Query ===")
    result = system.query("Recommend action movies with high revenue and positive sentiment")
    print(f"Answer: {result['answer']}")
    
    print("\n=== Comparison ===")
    comp = system.compare_movies([1, 2, 3], "budget, revenue, runtime")
    print(comp['summary'])

if __name__ == "__main__":
    main()

