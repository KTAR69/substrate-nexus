// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "UObject/NoExportTypes.h"
#include "Interfaces/IHttpRequest.h"
#include "TexasRootBlockchainAPI.generated.h"

/**
 * UTexasRootBlockchainAPI
 * Module to handle read-only data pulls from Polygon (EVM) and Solana (SVM).
 */
UCLASS(Blueprintable, BlueprintType)
class NEXUSHUB_TEXASROOT_API UTexasRootBlockchainAPI : public UObject
{
    GENERATED_BODY()

public:
    UTexasRootBlockchainAPI();

    /**
     * Fetch read-only data from Polymarket via Polygon EVM.
     * Uses eth_call JSON-RPC.
     * @param ContractAddress The address of the smart contract.
     * @param MethodData The encoded method signature and arguments.
     */
    UFUNCTION(BlueprintCallable, Category = "Blockchain|Polygon")
    void FetchPolymarketData(FString ContractAddress, FString MethodData);

    /**
     * Fetch telemetry for a DePIN node on Solana via SVM.
     * Uses getAccountInfo JSON-RPC.
     * Note: Slashing penalties are excluded as per Texas Root architecture.
     * @param AccountPubKey The public key of the DePIN account.
     */
    UFUNCTION(BlueprintCallable, Category = "Blockchain|Solana")
    void FetchDePINTelemetry(FString AccountPubKey);

private:
    // Delegate to handle Polygon responses
    void OnFetchPolymarketResponse(FHttpRequestPtr Request, FHttpResponsePtr Response, bool bWasSuccessful);

    // Delegate to handle Solana responses
    void OnFetchDePINTelemetryResponse(FHttpRequestPtr Request, FHttpResponsePtr Response, bool bWasSuccessful);
};
