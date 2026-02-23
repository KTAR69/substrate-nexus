// Fill out your copyright notice in the Description page of Project Settings.

#pragma once

#include "CoreMinimal.h"
#include "Engine/DeveloperSettings.h"
#include "TexasRootSettings.generated.h"

/**
 * UTexasRootSettings
 * Configuration settings for the Texas Root Blockchain module.
 */
UCLASS(Config=Engine, DefaultConfig, meta=(DisplayName="Texas Root Blockchain Settings"))
class NEXUSHUB_TEXASROOT_API UTexasRootSettings : public UDeveloperSettings
{
    GENERATED_BODY()

public:
    UTexasRootSettings();

    /** RPC Endpoint for Polygon Mainnet */
    UPROPERTY(Config, EditAnywhere, Category = "Endpoints", meta = (DisplayName = "Polygon RPC Endpoint"))
    FString PolygonRpcEndpoint;

    /** RPC Endpoint for Solana Mainnet Beta */
    UPROPERTY(Config, EditAnywhere, Category = "Endpoints", meta = (DisplayName = "Solana RPC Endpoint"))
    FString SolanaRpcEndpoint;
};
