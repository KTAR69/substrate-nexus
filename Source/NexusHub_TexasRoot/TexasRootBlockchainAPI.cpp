// Fill out your copyright notice in the Description page of Project Settings.

#include "TexasRootBlockchainAPI.h"
#include "HttpModule.h"
#include "Interfaces/IHttpResponse.h"
#include "Serialization/JsonSerializer.h"

// Define a log category for our blockchain module
DEFINE_LOG_CATEGORY_STATIC(LogTexasRootBlockchain, Log, All);

UTexasRootBlockchainAPI::UTexasRootBlockchainAPI()
{
}

void UTexasRootBlockchainAPI::FetchPolymarketData(FString ContractAddress, FString MethodData)
{
    // Polygon Mainnet RPC Endpoint (Example public endpoint)
    // In production, this should be configurable via Project Settings or a data table.
    FString Endpoint = TEXT("https://polygon-rpc.com");

    TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Request = FHttpModule::Get().CreateRequest();
    Request->SetURL(Endpoint);
    Request->SetVerb("POST");
    Request->SetHeader("Content-Type", "application/json");

    // Construct the JSON payload for eth_call
    // Docs: https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_call
    FString Payload = FString::Printf(TEXT(
        "{"
        "\"jsonrpc\":\"2.0\","
        "\"method\":\"eth_call\","
        "\"params\":[{"
            "\"to\": \"%s\","
            "\"data\": \"%s\""
        "}, \"latest\"],"
        "\"id\":1"
        "}"), *ContractAddress, *MethodData);

    Request->SetContentAsString(Payload);

    // Bind the response delegate
    Request->OnProcessRequestComplete().BindUObject(this, &UTexasRootBlockchainAPI::OnFetchPolymarketResponse);

    UE_LOG(LogTexasRootBlockchain, Log, TEXT("Sending Polygon Request to %s: %s"), *Endpoint, *Payload);
    Request->ProcessRequest();
}

void UTexasRootBlockchainAPI::OnFetchPolymarketResponse(FHttpRequestPtr Request, FHttpResponsePtr Response, bool bWasSuccessful)
{
    if (!bWasSuccessful || !Response.IsValid())
    {
        UE_LOG(LogTexasRootBlockchain, Error, TEXT("Polygon Request Failed."));
        return;
    }

    FString ResponseString = Response->GetContentAsString();
    UE_LOG(LogTexasRootBlockchain, Log, TEXT("Polygon Response: %s"), *ResponseString);

    // In a real implementation, we would parse the JSON here using FJsonSerializer
    // and extract the return data (result) from the hex string.
}

void UTexasRootBlockchainAPI::FetchDePINTelemetry(FString AccountPubKey)
{
    // Solana Mainnet Beta RPC Endpoint (Example public endpoint)
    FString Endpoint = TEXT("https://api.mainnet-beta.solana.com");

    TSharedRef<IHttpRequest, ESPMode::ThreadSafe> Request = FHttpModule::Get().CreateRequest();
    Request->SetURL(Endpoint);
    Request->SetVerb("POST");
    Request->SetHeader("Content-Type", "application/json");

    // Construct the JSON payload for getAccountInfo
    // Docs: https://solana.com/docs/rpc/http/getaccountinfo
    FString Payload = FString::Printf(TEXT(
        "{"
        "\"jsonrpc\":\"2.0\","
        "\"id\":1,"
        "\"method\":\"getAccountInfo\","
        "\"params\":["
            "\"%s\","
            "{"
                "\"encoding\": \"jsonParsed\""
            "}"
        "]"
        "}"), *AccountPubKey);

    // Note: No slashing penalty logic is included here.
    // DePIN validators on this network architecture are not penalized for downtime.
    // Telemetry is purely for monitoring uptime and data throughput.

    Request->SetContentAsString(Payload);

    // Bind the response delegate
    Request->OnProcessRequestComplete().BindUObject(this, &UTexasRootBlockchainAPI::OnFetchDePINTelemetryResponse);

    UE_LOG(LogTexasRootBlockchain, Log, TEXT("Sending Solana Request to %s: %s"), *Endpoint, *Payload);
    Request->ProcessRequest();
}

void UTexasRootBlockchainAPI::OnFetchDePINTelemetryResponse(FHttpRequestPtr Request, FHttpResponsePtr Response, bool bWasSuccessful)
{
    if (!bWasSuccessful || !Response.IsValid())
    {
        UE_LOG(LogTexasRootBlockchain, Error, TEXT("Solana Request Failed."));
        return;
    }

    FString ResponseString = Response->GetContentAsString();
    UE_LOG(LogTexasRootBlockchain, Log, TEXT("Solana Response: %s"), *ResponseString);

    // In a real implementation, we would parse the JSON here using FJsonSerializer
    // and extract the 'data' field to update the digital twin state.
    // Example: FJsonObjectConverter::JsonObjectStringToUStruct<FDePINTelemetryData>(ResponseString, &OutData);
}
